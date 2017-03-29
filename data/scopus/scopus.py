import requests
import json
from functools import wraps
import os
import hashlib
import traceback
import string

DEBUG = 0

CACHE_DIR = '.cache'
API_KEY = 'a52b0c7edc190b35f2740c8bde849893'
# API_KEY = '7f59af901d2d86f78a1fd60c1bf9426a'

proxies = {
    'http': 'socks5://localhost:22080',
    'https': 'socks5://localhost:22080',
}

SEARCH_URL = 'https://api.elsevier.com/content/search/scopus'
SIMPLE_METADATA_URL = 'https://api.elsevier.com/content/search/scopus'
FULL_METADATA_URL = 'https://api.elsevier.com/content/abstract/scopus_id/{}'
AFFILIATION_URL = 'https://api.elsevier.com/content/affiliation/affiliation_id/{}'

if not os.path.exists(CACHE_DIR):
    os.mkdir(CACHE_DIR)


def tuplize(something):
    if isinstance(something, list) or isinstance(something, tuple):
        something = tuple([tuplize(elem) for elem in something])
    elif isinstance(something, dict):
        something = tuple([(tuplize(k), tuplize(v)) for k, v in something.items()])
    return something


def cache(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        key = API_KEY + str(tuplize(args) + tuplize(kwargs))
        key = hashlib.sha224(key.encode('utf-8')).hexdigest()
        try:
            with open(os.path.join(CACHE_DIR, key), 'r') as f:
                data = json.load(f)
        except FileNotFoundError:
            data = func(*args, **kwargs)
            with open(os.path.join(CACHE_DIR, key), 'w') as f:
                json.dump(data, f)
        return data
    return wrapper


@cache
def requests_get(*args, **kwargs):
    if 'params' not in kwargs:
        kwargs['params'] = {}
    kwargs['params']['apiKey'] = API_KEY
    kwargs['params']['httpAccept'] = 'application/json'
    return requests.get(*args, **kwargs, proxies=proxies).json()


def scopus_search_by_title(title):
    title = title.strip(string.punctuation)
    params = {
        'query': 'TITLE-ABS-KEY ( "{}" ) '.format(title)
    }
    res = requests_get(SEARCH_URL, params=params)
    if 'service-error' in res:
        print(res)
    else:
        if int(res['search-results']['opensearch:totalResults']) > 0:
            return res
        else:
            return None


def scopus_find_by_sid(sid):
    res = requests_get(FULL_METADATA_URL.format(sid))
    if 'abstracts-retrieval-response' in res:
        return res['abstracts-retrieval-response']
    else:
        return None


def scopus_get_simple_metadata_by_eid(eid):
    params = {
        'query': 'EID({})'.format(eid)
    }
    return requests_get(SIMPLE_METADATA_URL, params=params)


def scopus_get_citing_papers_by_eid(eid):
    params = {
        'query': 'REFEID({})'.format(eid)
    }
    return requests_get(SIMPLE_METADATA_URL, params=params)


def scopus_get_full_metadata_by_eid(eid):
    simple_metadata = scopus_get_simple_metadata_by_eid(eid)
    sid = scopus_entry_get_sid(scopus_results_get_first_entry(simple_metadata))
    return requests_get(FULL_METADATA_URL.format(sid))


def scopus_get_affiliation_by_id(id):
    res = requests_get(AFFILIATION_URL.format(id))
    return res


def scopus_results_get_first_entry(results):
    return results['search-results']['entry'][0]


def scopus_entry_get_sid(entry):
    return entry['dc:identifier'].split(':')[-1]


def scopus_entry_get_eid(entry):
    return entry['eid']


def scopus_parse_author(simple_metadata, full_metadata):
    try:
        author = full_metadata['authors']['author']
    except TypeError:
        try:
            author = full_metadata['item']['bibrecord']['head']['author-group']['author']
        except KeyError:
            try:
                return [simple_metadata['dc:creator']]
            except KeyError:
                try:
                    author = full_metadata['coredata']['dc:creator']['author']
                except KeyError:
                    if DEBUG >= 2:
                        print("DIDNT FIND ANY AUTHOR")
                    return []
    return [x['ce:indexed-name'] for x in author]


def scopus_parse_keywords(full_metadata):
    if 'authkeywords' in full_metadata and isinstance(full_metadata['authkeywords'], dict):
        return [x['$'] for sublist in full_metadata['authkeywords'].values() for x in sublist]
    else:
        citation_info = full_metadata['item']['bibrecord']['head']['citation-info']
        if 'author-keywords' in citation_info:
            return [x['$'] for x in citation_info['author-keywords']['author-keyword']]
        elif isinstance(full_metadata['idxterms'], dict):
            return [x['$'] for x in full_metadata['idxterms']['mainterm']]
        else:
            if DEBUG >= 2:
                print("DIDNT FIND ANY KEYWORDS")  # TODO
            return []


def scopus_parse_reference(reference):
    results = []
    for x in reference:
        ref_info = x['ref-info']
        try:
            title = ref_info['ref-title']['ref-titletext']
        except KeyError:
            try:
                title = ref_info['ref-sourcetitle']
            except KeyError:
                title = ref_info['ref-text'].split('.')[0]
        sid = ref_info['refd-itemidlist']['itemid']['$']
        results.append({'title': title, 'sid': sid})
    return results


def scopus_parse_affiliation(full_metadata):
    try:
        affiliation = full_metadata['affiliation']
        if isinstance(affiliation, dict):
            affiliation = [affiliation]
        res = []
        for x in affiliation:
            affiliation_id = x['@id']
            x = scopus_get_affiliation_by_id(affiliation_id)['affiliation-retrieval-response']
            try:
                res.append({'name': x['affiliation-name'],
                            'address': x['address'],
                            'postal_code': x['institution-profile']['address']['postal-code'],
                            'city': x['city'],
                            'country': x['country']})
            except KeyError:
                pass
        return res
    except KeyError:
        if DEBUG >= 2:
            print("DIDNT FIND ANY AFFILIATION")
        return []


def scopus_parse_title(full_metadata):
    return full_metadata['coredata']['dc:title']


def scopus_parse_full_metadata(full_metadata):
    try:
        coredata = full_metadata['coredata']
        publication = {'name': coredata['prism:publicationName'],
                       # 'page_range': coredata['prism:pageRange'],
                       'cover_date': coredata['prism:coverDate'],
                       # 'cover_display_date': coredata['prism:coverDisplayDate'],
                       'type': coredata['prism:aggregationType'],
                       # 'subtype': coredata['subtype'],
                       # 'subtype_description': coredata['subtypeDescription'],
                       'source_id': coredata['source-id']}

        metadata = {
            'title': full_metadata['coredata']['dc:title'],
            'abstract': full_metadata['item']['bibrecord']['head']['abstracts'],
            # 'description': coredata['dc:description'],
            'affiliation': scopus_parse_affiliation(full_metadata),
            'publication': publication,
            'citedby_count': coredata['citedby-count'],
            'keywords': scopus_parse_keywords(full_metadata),
            'authors': scopus_parse_author(coredata, full_metadata),
            'references': scopus_parse_reference(full_metadata['item']['bibrecord']['tail']['bibliography']['reference'])
        }
        return metadata
    except (KeyError, TypeError, IndexError) as e:
        if DEBUG >= 2:
            print("\x1b[31m", e, "\x1b[0m")
            traceback.print_exc()


def get_metadata_by_title(title):
    results = scopus_search_by_title(title)
    if results is not None:
        eid = scopus_entry_get_eid(scopus_results_get_first_entry(results))
        full_metadata = scopus_get_full_metadata_by_eid(eid)["abstracts-retrieval-response"]
        return scopus_parse_full_metadata(full_metadata)


def get_references(metadata):
    references = []
    for ref in metadata['references']:
        ref_md = get_metadata_by_title(ref['title'])
        if ref_md is None:
            full_metadata = scopus_find_by_sid(ref['sid'])
            if full_metadata is not None:
                ref_md = scopus_parse_full_metadata(full_metadata)
        references.append(ref_md)
    return references

if __name__ == '__main__':
    import sys
    if len(sys.argv) > 2:
        if sys.argv[1] == '-D':
            DEBUG = int(sys.argv[2])
        else:
            DEBUG = 0
    # response = scopus_search_by_title('a survey on reactive programming')
    # print(response['search-results']['entry'])
    # 2-s2.0-84891048418
    # response = scopus_get_simple_metadata_by_eid('2-s2.0-84891048418')
    # print(response)
    # response = scopus_get_full_metadata_by_eid('2-s2.0-84891048418')
    # print(response)

    # def retrieve(title):
    #     if DEBUG >= 1:
    #         print(title + "...", end="")
    #     response = get_metadata_by_title(title)
    #     if DEBUG >= 1:
    #         if response is None:
    #             print("\x1b[31mFAILED\x1b[0m")
    #         else:
    #             print("\x1b[32mOK\x1b[0m")
    #     return response
    response = get_metadata_by_title('a survey on reactive programming')
    good = 1
    total = 1
    for ref1 in get_references(response):
        total += 1
        if ref1 is not None:
            good += 1
            for ref2 in get_references(ref1):
                total += 1
                if ref2 is not None:
                    good += 1

    print("SCORE: ", good / total)

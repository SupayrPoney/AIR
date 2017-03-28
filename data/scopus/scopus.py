import requests
import json
from functools import wraps
import os
import hashlib

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
    return requests.get(*args, **kwargs, proxies=proxies).text


def scopus_search_by_title(title):
    params = {
        'query': 'TITLE-ABS-KEY ( "{}" ) '.format(title)
    }
    return json.loads(requests_get(SEARCH_URL, params=params))


def scopus_get_simple_metadata_by_eid(eid):
    params = {
        'query': 'EID({})'.format(eid),
        'httpAccept': 'application/json'
    }
    return json.loads(requests_get(SIMPLE_METADATA_URL, params=params))


def scopus_get_citing_papers_by_eid(eid):
    params = {
        'query': 'REFEID({})'.format(eid),
        'httpAccept': 'application/json'
    }
    return json.loads(requests_get(SIMPLE_METADATA_URL, params=params))


def scopus_get_full_metadata_by_eid(eid):
    simple_metadata = scopus_get_simple_metadata_by_eid(eid)
    sid = scopus_entry_get_sid(scopus_results_get_first_entry(simple_metadata))
    params = {
        'httpAccept': 'application/json'
    }
    return json.loads(requests_get(FULL_METADATA_URL.format(sid), params=params))


def scopus_get_affiliation_by_id(id):
    params = {
        'httpAccept': 'application/json'
    }
    return json.loads(requests_get(AFFILIATION_URL.format(id), params=params))


def scopus_results_get_first_entry(results):
    return results['search-results']['entry'][0]


def scopus_entry_get_sid(entry):
    return entry['dc:identifier'].split(':')[-1]


def scopus_entry_get_eid(entry):
    return entry['eid']


def scopus_parse_author(author):
    return [{'firstname': x['ce:given-name'],
             'initials': x['ce:initials'],
             'lastname': x['ce:surname']} for x in author]


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
            pass  # TODO


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
        results.append({'title': title})
    return results


def get_metadata_by_title(title):
    results = scopus_search_by_title(title)
    eid = scopus_entry_get_eid(scopus_results_get_first_entry(results))
    simple_metadata = scopus_results_get_first_entry(scopus_get_simple_metadata_by_eid(eid))
    full_metadata = scopus_get_full_metadata_by_eid(eid)["abstracts-retrieval-response"]
    affiliation_id = full_metadata['affiliation']['@id']
    affiliation = scopus_get_affiliation_by_id(affiliation_id)['affiliation-retrieval-response']
    coredata = full_metadata['coredata']
    creators = coredata['dc:creator']['author']
    # print(json.dumps(full_metadata))
    # print(json.dumps(simple_metadata))
    # print(affiliation)
    metadata = {
        # 'sid': scopus_entry_get_sid(simple_metadata),
        # 'eid': eid,
        'doi': simple_metadata['prism:doi'],
        'title': simple_metadata['dc:title'],
        'abstract': full_metadata['item']['bibrecord']['head']['abstracts'],
        'description': coredata['dc:description'],
        'creators': scopus_parse_author(creators),
        'affiliation': {'name': affiliation['affiliation-name'],
                        'address': affiliation['address'],
                        'postal_code': affiliation['institution-profile']['address']['postal-code'],
                        'city': affiliation['city'],
                        'country': affiliation['country']},
        'publication': {'name': simple_metadata['prism:publicationName'],
                        'issn': simple_metadata['prism:issn'],
                        'e_issn': simple_metadata['prism:eIssn'],
                        'volume': simple_metadata['prism:volume'],
                        'issue_identifier': simple_metadata['prism:issueIdentifier'],
                        'page_range': simple_metadata['prism:pageRange'],
                        'cover_date': simple_metadata['prism:coverDate'],
                        'cover_display_date': simple_metadata['prism:coverDisplayDate'],
                        'type': simple_metadata['prism:aggregationType'],
                        'subtype': simple_metadata['subtype'],
                        'subtype_description': simple_metadata['subtypeDescription'],
                        # 'number': simple_metadata['article-number'],
                        'source_id': simple_metadata['source-id']},
        'citedby_count': simple_metadata['citedby-count'],
        'keywords': scopus_parse_keywords(full_metadata),
        'authors': scopus_parse_author(full_metadata['authors']['author']),
        'references': scopus_parse_reference(full_metadata['item']['bibrecord']['tail']['bibliography']['reference'])
    }
    return metadata

if __name__ == '__main__':
    # response = scopus_search_by_title('a survey on reactive programming')
    # print(response['search-results']['entry'])
    # 2-s2.0-84891048418
    # response = scopus_get_simple_metadata_by_eid('2-s2.0-84891048418')
    # print(response)
    # response = scopus_get_full_metadata_by_eid('2-s2.0-84891048418')
    # print(response)
    response = get_metadata_by_title('a survey on reactive programming')
    print(response['title'])
    for ref in response['references']:
        resp2 = get_metadata_by_title(ref['title'])
        print(resp2['title'])
    pass

import requests

proxies = {
    'http': 'socks5://localhost:22080',
    'https': 'socks5://localhost:22080',
}

SEARCH_URL = 'https://api.elsevier.com/content/search/scopus'


def requests_get(*args, **kwargs):
    if 'params' in kwargs:
        params = kwargs['params']
    else:
        params = {}
    params['apiKey'] = '7f59af901d2d86f78a1fd60c1bf9426a'
    return requests.get(*args, **kwargs, proxies=proxies)


def scopus_search_by_title(title):
    params = {
        'query': 'TITLE-ABS-KEY ( "{}" ) '.format(title)
    }
    return requests_get(SEARCH_URL, params=params)


if __name__ == '__main__':
    response = scopus_search_by_title('a survey on reactive programming')
    print(response.json()['search-results']['entry'])

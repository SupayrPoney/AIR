import requests
import json
from functools import wraps

CACHE_FILE = '.cache'
API_KEY = 'a52b0c7edc190b35f2740c8bde849893'

proxies = {
    'http': 'socks5://localhost:22080',
    'https': 'socks5://localhost:22080',
}

SEARCH_URL = 'https://api.elsevier.com/content/search/scopus'


def tuplize(something):
    if isinstance(something, list) or isinstance(something, tuple):
        something = tuple([tuplize(elem) for elem in something])
    elif isinstance(something, dict):
        something = tuple([(tuplize(k), tuplize(v)) for k, v in something.items()])
    return something


def cache(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        key = str(tuplize(args) + tuplize(kwargs))
        try:
            with open(CACHE_FILE, 'r') as f:
                data = json.load(f)
        except FileNotFoundError:
            data = {}
        if key not in data:
            data[key] = func(*args, **kwargs)
            with open(CACHE_FILE, 'w') as f:
                json.dump(data, f)
        return data[key]
    return wrapper


@cache
def requests_get(*args, **kwargs):
    if 'params' in kwargs:
        params = kwargs['params']
    else:
        params = {}
    params['apiKey'] = API_KEY
    return requests.get(*args, **kwargs, proxies=proxies).text


def scopus_search_by_title(title):
    params = {
        'query': 'TITLE-ABS-KEY ( "{}" ) '.format(title)
    }
    return requests_get(SEARCH_URL, params=params)


if __name__ == '__main__':
    response = scopus_search_by_title('a survey on reactive programming')
    print(json.loads(response)['search-results']['entry'])

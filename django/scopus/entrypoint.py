from scopus.scraper import get_metadata_by_doi, get_metadata_by_sid, get_metadata_by_title, get_citers_by_eid
from django.utils.http import urlquote


def doi(doi):
    return get_metadata_by_doi(doi)


def sid(doi):
    return get_metadata_by_sid(sid)


def title(title):
    return get_metadata_by_title(title)


def right_of(paper):
    return [
        {
            "title": x['title'],
            "url": "/pomme_d_api?light&sid=%s&title=%s" % (
                urlquote(x['sid']),
                urlquote(x['title'])
            )

        }
        for x in paper['references']
    ]


def left_of(paper):
    citers = get_citers_by_eid(paper['eid'])
    if citers is None:
        citers = []

    return [
        {
            "title": x['title'],
            "url": "/pomme_d_api?light&sid=%s&title=%s" % (
                urlquote(x['sid']),
                urlquote(x['title'])
            )

        }
        for x in citers
    ]

from scopus.scraper import get_metadata_by_doi, get_metadata_by_sid, get_metadata_by_title, get_citers_by_eid, get_founding_paper
from django.utils.http import urlquote
from scopus import geo


def pre_process(fn):
    def inner(*args, **kwargs):
        paper = fn(*args, **kwargs)
        if paper:
            paper["next"] = next_of(paper)
            paper["prev"] = prev_of(paper)
            for aff in paper["affiliation"]:
                aff["geo"] = geo.geocode(aff["city"], aff["country"])
            return paper
    return inner


@pre_process
def doi(doi):
    return get_metadata_by_doi(doi)


@pre_process
def sid(doi):
    return get_metadata_by_sid(sid)


@pre_process
def title(title):
    return get_metadata_by_title(title.lower())


def prev_of(paper):
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


def next_of(paper):
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


def founding_paper(sid, title, keywords):
    paper = get_metadata_by_sid(sid)
    if not paper:
        paper = get_metadata_by_title(title.lower())
    if not paper:
        return None

    founding = get_founding_paper(paper, set(k.lower() for k in keywords))
    return founding

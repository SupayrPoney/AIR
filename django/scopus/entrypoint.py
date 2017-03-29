from scopus.scraper import get_metadata_by_doi, get_metadata_by_sid, get_metadata_by_title


def doi(doi):
    return get_metadata_by_doi(doi)


def sid(doi):
    return get_metadata_by_sid(sid)


def title(title):
    return get_metadata_by_title(title)

from scopus.scraper import get_metadata_by_title, get_citers_by_eid
import sys

titles = [
    "DocTr: A unifying framework for tracking physical documents and organisational structures ",
    "Optimal reactive power dispatch: A review, and a new stochastic voltage stability constrained multi-objective model at the presence of uncertain wind power generation",
    "Towards task analysis tool support",
    "ECOVAL: A framework for increasing the ecological validity in usability testing",
    "Do i have to press the big button labelled spacebar to separate two words?",
    "STRATUS: A questionnaire for strategic usability assessment",
    "A survey on reactive programming",
]

i = 0
while(len(titles) > 0):
    i += 1

    title = titles.pop(0)

    paper = get_metadata_by_title(title.lower())

    prev = [x["title"] for x in paper['references']]
    next = [x["title"] for x in get_citers_by_eid(paper['eid'])]

    titles.extend(prev)
    titles.extend(next)

    if i % 20 == 0:
        print("")
    print(".",)
    sys.stdout.flush()

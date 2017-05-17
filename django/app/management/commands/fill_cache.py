from scopus.scraper import get_metadata_by_title, get_citers_by_eid
import sys


from django.core.management.base import BaseCommand


class Command(BaseCommand):
    def handle(self, *args, **options):
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
            if i % 20 == 0:
                print("\n%s items in the queue, %i papers done" % (len(titles), i))
            print(".", end="")
            sys.stdout.flush()

            title = titles.pop(0)

            try:

                paper = get_metadata_by_title(title.lower())
                if not paper:
                    continue

                prev = paper['references']

                if prev:
                    prev = [x["title"] for x in prev]
                else:
                    prev = []

                next = get_citers_by_eid(paper['eid'])
                if next:
                    next = [x["title"] for x in next]
                else:
                    next = []

                titles.extend(prev)
                titles.extend(next)
            except Exception as e:
                print(e)

            i += 1

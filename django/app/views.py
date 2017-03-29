from django.shortcuts import render
from django.http import JsonResponse, Http404

from scopus import entrypoint


def home(request):
    context = {

    }
    return render(request, "home.html", context)


def api(request):
    identifiers = [
        ("doi", entrypoint.doi),
        ("sid", entrypoint.sid),
        ("title", entrypoint.title),

    ]
    paper = None
    for key, fn in identifiers:
        if key in request.GET:
            paper = fn(request.GET[key])
            if paper is not None:
                break

    if paper is not None:
        paper["left"] = entrypoint.left_of(paper)
        paper["right"] = entrypoint.right_of(paper)
        return JsonResponse(paper)
    else:
        raise Http404("No paper for you, sorry")

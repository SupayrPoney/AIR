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
        return JsonResponse(paper)
    else:
        raise Http404("No paper for you, sorry")


def prev(request):
    paper = entrypoint.title(request.GET['title'])
    if paper is not None:
        res = []
        for prev in paper['prev']:
            prev = entrypoint.title(prev['title'])
            if prev is not None:
                res.append(prev)
        return JsonResponse({"prev": res})
    else:
        raise Http404("No paper for you, sorry")


def next(request):
    paper = entrypoint.title(request.GET['title'])
    if paper is not None:
        res = []
        for next in paper['next']:
            next = entrypoint.title(next['title'])
            if next is not None:
                res.append(next)
        return JsonResponse({"next": res})
    else:
        raise Http404("No paper for you, sorry")

from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.home, name='home'),
    url(r'^pomme_d_api$', views.api, name='api'),
    url(r'^pomme_de_prev$', views.prev, name='prev'),
    url(r'^pomme_de_next$', views.next, name='next')
]

from django.conf.urls import patterns, url

from apps.fuelmapper import views

urlpatterns = patterns('',
	url(r'^$', views.index, name="index"),
)
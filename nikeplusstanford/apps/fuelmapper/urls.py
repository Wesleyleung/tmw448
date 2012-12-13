from django.conf.urls import patterns, url

from apps.fuelmapper import views

urlpatterns = patterns('',
	url(r'^$', views.index, name="index"),
	url(r'^loadStaticJSON$', views.loadStaticJSON, name="loadStaticJSON"),
	url(r'^loadSportFromZipcodeViewJSON$', views.loadSportFromZipcodeViewJSON, name="loadSportFromZipcodeViewJSON"),
	url(r'^zip_info$', views.zip_info, name="zip_info"),
)
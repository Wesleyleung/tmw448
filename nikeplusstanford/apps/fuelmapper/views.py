from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.conf import settings
import json
import httplib2
from os import environ

def index(request):
	context = {}
	return render(request, 'fuelmapper/index.html', context)

def loadStaticJSON(request):
	json_file = request.GET['json_file']
	if environ.get('HEROKU') is 'yes':
		h = httplib2.Http()
		request_url = settings.STATIC_ROOT + '/js/%s' % json_file
		response, content = h.request(request_url)
		return HttpResponse(content, mimetype='application/json')
	else:
		content = open(settings.STATIC_ROOT + '/js/%s' % json_file)
		return HttpResponse(content.read(), mimetype='application/json')

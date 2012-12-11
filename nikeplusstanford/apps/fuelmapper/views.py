from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.conf import settings
import json
import math
import httplib2
from os import environ

from apps.fuelmapper.models	import NikeSportActivity, NikeUser

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

def loadSportFromZipcodeViewJSON(request):
	print request

	swLat = request.GET['swLat']
	swLng = request.GET['swLng']
	neLat = request.GET['neLat']
	neLng = request.GET['neLng']


	test = int(math.floor(swLat))
	print test

	print swLat, swLng, neLat, neLng
	
	for i in range(int(math.floor(swLat)), int(math.ceil(neLat))):
		for j in range(int(math.floor(swLng)), int(math.ceil(neLng))):
			print i, j


	output = NikeSportActivity.objects.all()[:5]

	out_array = []
	for activity in output:
		out_array.append(activity.get_JSON())	
	return HttpResponse(json.dumps(out_array), mimetype='application/json')



# #loadSportFromZipcodeViewJSON?swLat=36.66560863153126&swLng=-125.43725519921873&neLat=38.174996763572814&neLng=-118.89489680078123



# 	sport_activty_data = NikeSportActivity.objects.all()[:1]
# 	return 0

# def NikeModelToJSON

# [<NikeSportActivity: e55fbb86-73ae-4467-9eaa-f97137be82cc>, 
# 	#params start time, end time, 
# 	#params 4 lat, lng pairs
# 	#geocoding. 


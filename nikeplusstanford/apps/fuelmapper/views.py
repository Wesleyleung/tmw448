from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.conf import settings
import json
import math
import httplib2 
from urllib import urlencode
from os import environ

from apps.fuelmapper.models	import NikeSportActivity, NikeUser,PostalCode

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
	centerLat = request.GET['lat']
	centerLng = request.GET['lng']
	radius = request.GET['radius']
	maxRows = request.GET['maxRows']

	request_url = "http://ws.geonames.org/findNearbyPostalCodesJSON?"
	data = {'formatted': True, 'lat': request.GET['lat'], 'lng': centerLng, 'radius': radius, 'maxRows': maxRows}
	h = httplib2.Http()
	resp, content = h.request(request_url + urlencode(data), method="GET")
	if resp.status == 200:
		data = json.loads(content)
		zipcodeParams = []
		for obj in data['postalCodes']:
			zipcodeParams.append(obj['postalCode'])

		#LOCAL DEV ONLY
		# zipcodeParams.append(60448)
		# PostalCode.find_or_create_code("60448")
		# PostalCode.objects.get(postalcode='60448')
		# output = NikeSportActivity.objects.filter(postal_code=60448) 


		output = NikeSportActivity.objects.filter(postal_code__in=zipcodeParams) 
		out_array = []
		for activity in output:
			out_array.append(activity.get_JSON())	

		return HttpResponse(json.dumps(out_array), mimetype='application/json')
	else:
		return resp.status

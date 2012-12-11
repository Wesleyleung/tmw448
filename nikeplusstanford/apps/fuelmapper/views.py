from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
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

# We expect this to be a POST with these parameters in the body
# zipCodes = array of strings representing zip codes to search and return data for
# startTime & endTime = unix encoded time values
@csrf_exempt
def loadSportFromZipcodeViewJSON(request):
# #loadSportFromZipcodeViewJSON?swLat=36.66560863153126&swLng=-125.43725519921873&neLat=38.174996763572814&neLng=-118.89489680078123
	try:
		centerLat = request.GET['lat']
		centerLng = request.GET['lng']
		radius = request.GET['radius']
		maxRows = request.GET['maxRows']
	except KeyError:
		responseDict = {'status' : 'ERROR',
						'description' : 'Insufficient parameters.'}	
		return HttpResponse(json.dumps(responseDict), mimetype='application/json', status=400)

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

	print zipcodeParams
	activities_found = NikeSportActivity.objects.filter(postal_code__in=zipcodeParams) 

	for activity in activities_found:
		activities_array.append(activity.get_JSON())
	responseDict = {'success' : 'OK',
						'parameters' : {'zipCodes' : zipCodes,
										'startTime' : startTime,
										'endTime' : endTime},
						'data' : {'activities': activities_array,
								  'count' : len(activities_array)}}	
	return HttpResponse(json.dumps(responseDict), mimetype='application/json')

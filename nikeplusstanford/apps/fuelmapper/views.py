from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
import json
import math
import httplib2 
from urllib import urlencode
from os import environ
from datetime import datetime, timedelta
from pytz import timezone, utc

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
# lat, lng = coordinates of the center of the view
# radius = zip code search radius
# startTime & endTime = unix encoded time values
def loadSportFromZipcodeViewJSON(request):
	if not request.method == 'GET':
		responseDict = {'status' : 'ERROR',
						'description' : 'Must be a get request.'}	
		return HttpResponse(json.dumps(responseDict), mimetype='application/json', status=400)
	try:
		centerLat = request.GET['lat']
		centerLng = request.GET['lng']
		radius = request.GET['radius']
		startTime = float(request.GET['startTime'])
		endTime = float(request.GET['endTime'])
	except KeyError:
		responseDict = {'status' : 'ERROR',
						'description' : 'Insufficient parameters.'}	
		return HttpResponse(json.dumps(responseDict), mimetype='application/json', status=400)

	print 'STARTING ZIP CODE REQUEST'

	request_url = "http://ws.geonames.org/findNearbyPostalCodesJSON?"
	zip_request_data = {'lat': centerLat, 'lng': centerLng, 'radius': radius, 'maxRows' : 100}
	h = httplib2.Http()
	zipCodeData = None
	resp, content = h.request(request_url + urlencode(zip_request_data), method="GET")
	if resp.status == 200:
		zipCodeData = json.loads(content)
	else:
		responseDict = {'status' : 'ERROR',
						'description' : 'Could not find zip codes'}	
		return HttpResponse(json.dumps(responseDict), mimetype='application/json', status=400)

	print 'ZIP CODES FOUND'
	
	zipcodes_found = []
	for obj in zipCodeData['postalCodes']:
		zipcodes_found.append(obj['postalCode'])

	#LOCAL DEV ONLY
	if environ.get('HEROKU') is not 'yes':
		zipcodes_found.append('60448')

	nike_hour_offset = 7 * 3600
	startTime_timedate = datetime.fromtimestamp(startTime, utc)
	endTime_timedate = datetime.fromtimestamp(endTime, utc)
	print startTime_timedate
	print endTime_timedate

	print 'STARTING ACTIVITY QUERY'

	activities_found = NikeSportActivity.objects.filter(postal_code__in=zipcodes_found
													).filter(start_time_local__gte=startTime_timedate
													).filter(start_time_local__lte=endTime_timedate) 

	print 'STARTING ACTIVITY SORT'

	activities_found = sorted(activities_found, key=lambda activity: activity.start_time_local, reverse=True)

	print 'ACTIVITIES SORTED'

	activities_array = []
	for activity in activities_found:
		activities_array.append(activity.get_JSON())
	responseDict = {'success' : 'OK',
						'parameters' : {'zipCodes' : zipcodes_found},
						'data' : {'activities': activities_array,
								  'count' : len(activities_array)}}	
	print 'CREATED RESPONSE DICT'
	return HttpResponse(json.dumps(responseDict), mimetype='application/json')

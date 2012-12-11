from django.http import HttpResponse, HttpResponseRedirect, StreamingHttpResponse
from django.shortcuts import render
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import condition
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

def responseGenerator(request):
	limit = 1000
	if 'limit' in request.GET:
		limit = request.GET['limit']
		limit = int(limit)

	skip = 0
	if 'skip' in request.GET:
		skip = request.GET['skip']
		skip = int(skip)

	print 'STARTING ZIP CODE REQUEST'
	centerLat = request.GET['lat']
	centerLng = request.GET['lng']
	radius = request.GET['radius']
	startTime = float(request.GET['startTime'])
	endTime = float(request.GET['endTime'])

	yield ' '
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
		yield json.dumps(responseDict)

	print 'ZIP CODES FOUND'
	
	zipcodes_found = []
	zipcode_objects = {}
	for obj in zipCodeData['postalCodes']:
		zipcodes_found.append(obj['postalCode'])
		zipcode_objects[obj['postalCode']] = PostalCode.find_or_create_code(obj['postalCode'])

	#LOCAL DEV ONLY
	if environ.get('HEROKU') is not 'yes':
		zipcodes_found.append('60448')
		zipcode_objects['60448'] = PostalCode.find_or_create_code('60448')

	nike_hour_offset = 7 * 3600
	startTime_timedate = datetime.fromtimestamp(startTime, utc)
	endTime_timedate = datetime.fromtimestamp(endTime, utc)
	print startTime_timedate
	print endTime_timedate

	print 'STARTING ACTIVITY QUERY'
	yield ' '
	activities_found_count = NikeSportActivity.objects.filter(postal_code__in=zipcodes_found
													).filter(start_time_local__gte=startTime_timedate
													).filter(start_time_local__lte=endTime_timedate
													).count()
	yield ' '
	print 'STARTING DB REQUEST WITH SORT'
	activities_found = NikeSportActivity.objects.filter(postal_code__in=zipcodes_found
													).filter(start_time_local__gte=startTime_timedate
													).filter(start_time_local__lte=endTime_timedate
													).order_by('start_time_local')[skip:skip+limit]
	yield ' '
	print 'ACTIVITIES SORTED IN DB'

	# activities_found = sorted(activities_found, key=lambda activity: activity.start_time_local, reverse=True)
	# yield ' '
	# print 'ACTIVITIES SORTED'

	activities_array = []
	for activity in activities_found:
		activity_JSON = activity.get_JSON()
		activity_JSON['postal_code'] = zipcode_objects[activity.postal_code].get_JSON()
		activities_array.append(activity_JSON)
	responseDict = {'success' : 'OK',
						'parameters' : {'zipCodes' : zipcodes_found,
										'limit' : limit,
										'skip' : skip,
										'total' : activities_found_count},
						'data' : {'activities': activities_array,
								  'count' : len(activities_array),
								  'total' : activities_found_count}}	
	print 'CREATED RESPONSE DICT'
	yield ' '
	yield json.dumps(responseDict)

# We expect this to be a POST with these parameters in the body
# lat, lng = coordinates of the center of the view
# radius = zip code search radius
# startTime & endTime = unix encoded time values
@condition(etag_func=None)
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

	

	response = HttpResponse(responseGenerator(request), content_type='application/json')

	return response

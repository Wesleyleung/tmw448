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
	# radius = int(request.GET['radius'])
	radius = 20
	# we're limited to a radius of 30 by the service
	if radius > 30:
		radius = 30
	startTime = float(request.GET['startTime'])
	endTime = float(request.GET['endTime'])
	
	yield ' '
	request_url = "http://ws.geonames.org/findNearbyPostalCodesJSON?"
	zip_request_data = {'lat': centerLat, 'lng': centerLng, 'radius': radius, 'maxRows' : 3}
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
	# if environ.get('HEROKU') is not 'yes':
	# 	zipcodes_found.append('60448')
	# 	zipcode_objects['60448'] = PostalCode.find_or_create_code('60448')

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
	aggregates = {'data' : []}
	max_fuel_in_range = 0
	aggregates_data = aggregates['data']
	activities_array = []
	days = []
	for activity in activities_found:
		max_fuel_in_range = max(max_fuel_in_range, activity.fuel_amt)
		activity_JSON = activity.get_JSON()
		activity_JSON['postal_code'] = zipcode_objects[activity.postal_code].get_JSON()
		index = 0
		try:
			index = days.index(activity_JSON['start_time_standard'])
		except ValueError:
			aggregates_data.append({'date' : activity_JSON['start_time_standard'],
								    'totalFuel' : 0,
								    'zipcodes' : [],
								    'zipkeys' : []})
			days.append(activity_JSON['start_time_standard'])
			index = days.index(activity_JSON['start_time_standard'])
		day = aggregates_data[index]
		day['totalFuel'] = day['totalFuel'] + activity.fuel_amt
		zip_index = 0
		try:
			zip_index = day['zipkeys'].index(activity.postal_code)
		except ValueError:
			day['zipkeys'].append(activity.postal_code)
			day['zipcodes'].append({activity.postal_code : 0})
			zip_index = day['zipkeys'].index(activity.postal_code)
		day['zipcodes'][zip_index][activity.postal_code] = day['zipcodes'][zip_index][activity.postal_code] + activity.fuel_amt

		activities_array.append(activity_JSON)
	if len(days) > 0:
		aggregates['maxFuelInRange'] = max_fuel_in_range
		aggregates['startDate'] = days[0]
		aggregates['endDate'] = days.pop()
	else:
		aggregates['maxFuelInRange'] = 0
		aggregates['startDate'] = 0
		aggregates['endDate'] = 0
	responseDict = {'success' : 'OK',
						'parameters' : {'zipCodes' : zipcodes_found,
										'limit' : limit,
										'skip' : skip,
										'total' : activities_found_count},
						'data' : {'activities': activities_array,
								  'count' : len(activities_array),
								  'total' : activities_found_count,
								  'aggregates' : aggregates}}	
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

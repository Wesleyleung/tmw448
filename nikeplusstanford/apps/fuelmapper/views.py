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
	neLat = request.GET['neLat']
	neLng = request.GET['neLng']
	swLat = request.GET['swLat']
	swLng = request.GET['swLng']
	# radius = int(request.GET['radius'])
	radius = 20
	# we're limited to a radius of 30 by the service
	if radius > 30:
		radius = 30
	startTime = float(request.GET['startTime'])
	endTime = float(request.GET['endTime'])
	
	yield ' '

	zipcodes_found = PostalCode.objects.filter(lat__gte=swLat).filter(lng__gte=swLng).filter(lat__lte=neLat).filter(lng__lte=neLng)
	zipcode_strings = []
	zipcode_objects = {}
	for zipcode in zipcodes_found:
		zipcode_strings.append(zipcode.postalcode)
		zipcode_objects[zipcode.postalcode] = zipcode

	yield ' '
	print 'ZIP CODES FOUND LOCALLY'
	print zipcode_strings

	startTime_timedate = datetime.fromtimestamp(startTime, utc)
	endTime_timedate = datetime.fromtimestamp(endTime, utc)

	print 'STARTING ACTIVITY QUERY'
	yield ' '
	activities_found_count = NikeSportActivity.objects.filter(postal_code__in=zipcode_strings
													).filter(start_time_local__gte=startTime_timedate
													).filter(start_time_local__lte=endTime_timedate
													).count()
	yield ' '
	print 'STARTING DB REQUEST WITH SORT'
	activities_found = NikeSportActivity.objects.filter(postal_code__in=zipcode_strings
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
		max_fuel_in_range = max(max_fuel_in_range, day['totalFuel'])
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
		aggregates['data'] = None
	if len(activities_array) > 0:
		responseDict = {'success' : 'OK',
							'parameters' : {'zipCodes' : zipcode_strings,
											'limit' : limit,
											'skip' : skip,
											'total' : activities_found_count},
							'data' : {'activities': activities_array,
									  'count' : len(activities_array),
									  'total' : activities_found_count,
									  'aggregates' : aggregates}}
	else:
		responseDict = {'success' : 'OK',
						'parameters' : None,
						'data' : None}	
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
		neLat = request.GET['neLat']
		neLng = request.GET['neLng']
		swLat = request.GET['swLat']
		swLng = request.GET['swLng']
		# radius = request.GET['radius']
		startTime = float(request.GET['startTime'])
		endTime = float(request.GET['endTime'])
	except KeyError:
		responseDict = {'status' : 'ERROR',
						'description' : 'Insufficient parameters.'}	
		return HttpResponse(json.dumps(responseDict), mimetype='application/json', status=400)

	

	response = HttpResponse(responseGenerator(request), content_type='application/json')

	return response

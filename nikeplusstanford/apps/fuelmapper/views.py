from django.http import HttpResponse, HttpResponseRedirect, StreamingHttpResponse
from django.shortcuts import render
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import condition
from django.db.models import Count
import json
import math
import httplib2 
from urllib import urlencode
from os import environ
from datetime import datetime, timedelta
from pytz import timezone, utc
from django.views.decorators.cache import cache_page

from apps.fuelmapper.models	import NikeSportActivity, NikeUser,PostalCode

@cache_page(60 * 60 * 15)
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

	zip_limit = 5000
	if 'zip_limit' in request.GET:
		zip_limit = request.GET['zip_limit']
		zip_limit = int(zip_limit)

	print 'STARTING ZIP CODE REQUEST'
	neLat = request.GET['neLat']
	neLng = request.GET['neLng']
	swLat = request.GET['swLat']
	swLng = request.GET['swLng']
	startTime = float(request.GET['startTime'])
	endTime = float(request.GET['endTime'])
	
	yield ' '
	zipcodes_found = PostalCode.objects.filter(lat__gte=swLat).filter(lng__gte=swLng).filter(lat__lte=neLat).filter(lng__lte=neLng)[:zip_limit]
	zipcode_strings = []
	zipcode_objects = {}
	zipcodes_return = {}
	for zipcode in zipcodes_found:
		zipcode_strings.append(zipcode.postalcode)
		zipcode_objects[zipcode.postalcode] = zipcode
		zipcodes_return[zipcode.postalcode] = zipcode.get_JSON()
	zip_limit = int(limit / len(zipcode_strings))
	zip_skip = int(skip / len(zipcode_strings))

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
	# activities_found = []
	# for zipcode in zipcode_strings:
	# 	print 'query for : %s' % zipcode
	# 	activities_here = NikeSportActivity.objects.filter(postal_code=zipcode
	# 													).filter(start_time_local__gte=startTime_timedate
	# 													).filter(start_time_local__lte=endTime_timedate
	# 													).order_by('start_time_local'
	# 													).only('sport_activity_id', 'upm_user_id',
	# 														   'nike_plus_user_id', 'start_time_local',
	# 														   'fuel_amt', 'postal_code')[zip_skip : zip_skip + zip_limit]
	# 	# print activities_here
	# 	print 'adding to array'
	# 	for activity in activities_here:
	# 		activities_found.append(activity)
	# print activities_found
	print 'STARTING DB REQUEST WITH SORT'
	activities_found = NikeSportActivity.objects.filter(postal_code__in=zipcode_strings
													).filter(start_time_local__gte=startTime_timedate
													).filter(start_time_local__lte=endTime_timedate
													).order_by('start_time_local'
													).only('sport_activity_id', 'upm_user_id',
														   'nike_plus_user_id', 'start_time_local',
														   'fuel_amt', 'postal_code')[skip:skip+limit]
	yield ' '
	print 'ACTIVITIES SORTED IN DB'

	print 'STARTING TO CALCULATE AGGREGATES'
	aggregates = {'data' : []}
	max_fuel_in_range = 0
	aggregates_data = aggregates['data']
	activities_array = []
	days = []
	# timedelta = endTime_timedate - startTime_timedate
	for activity in activities_found:
		yield ' '
		activity_JSON = activity.get_JSON()
		# activity_JSON['postal_code'] = zipcode_objects[activity.postal_code].get_JSON()
		# if timedelta.days > 2:
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
		yield ' '
	if len(days) > 0:
		aggregates['maxFuelInRange'] = max_fuel_in_range
		aggregates['startDate'] = days[0]
		aggregates['endDate'] = days.pop()

	print 'FINISHED CALCULATING AGGREGATES'
	yield ' '
	

	if len(activities_array) > 0:
		responseDict = {'success' : 'OK',
							'parameters' : {'zipCodes' : zipcodes_return,
											'limit' : limit,
											'skip' : skip,
											'total' : activities_found_count},
							'data' : {'activities': activities_array,
									  'count' : len(activities_array),
									  'total' : activities_found_count,
									  'aggregates' : aggregates}}
	else:
		responseDict = {'success' : 'NO DATA',
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
# @cache_page(60 * 60 * 15)
def loadSportFromZipcodeViewJSON(request):
	if not request.method == 'GET':
		responseDict = {'status' : 'ERROR',
						'description' : 'Must be a get request.'}	
		return HttpResponse(json.dumps(responseDict), mimetype='application/json', status=400)
	try:
		neLat = request.GET['neLat']
		neLng = request.GET['neLng']
		swLat = request.GET['swLat']
		swLng = request.GET['swLng']
		startTime = float(request.GET['startTime'])
		endTime = float(request.GET['endTime'])
	except KeyError:
		responseDict = {'status' : 'ERROR',
						'description' : 'Insufficient parameters.'}	
		return HttpResponse(json.dumps(responseDict), mimetype='application/json', status=400)

	response = HttpResponse(responseGenerator(request), content_type='application/json')

	return response


def zip_info(request):
	if request.method == 'GET':
		zipcode = request.GET['zipcode']
		try:
			zip_obj = PostalCode.objects.get(postalcode=zipcode)
			return HttpResponse(json.dumps(zip_obj.get_JSON()), mimetype='application/json', status=200)
		except PostalCode.DoesNotExist:
			responseDict = {'status' : 'ERROR',
							'description' : 'Insufficient parameters.'}	
			return HttpResponse(json.dumps(responseDict), mimetype='application/json', status=400)
	else:
		responseDict = {'status' : 'ERROR',
						'description' : 'Only GET supported.'}	
		return HttpResponse(json.dumps(responseDict), mimetype='application/json', status=400)



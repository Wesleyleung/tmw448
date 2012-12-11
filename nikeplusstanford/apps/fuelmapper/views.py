from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
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

# We expect this to be a POST with these parameters in the body
# zipCodes = array of strings representing zip codes to search and return data for
# startTime & endTime = unix encoded time values
@csrf_exempt
def loadSportFromZipcodeViewJSON(request):
	jsonPOST = json.loads(request.body)
	try:
		zipCodes = jsonPOST['zipCodes']
		startTime = jsonPOST['startTime']
		endTime = jsonPOST['endTime']
		# startTime = 0
		# endTime = 1
	except KeyError:
		responseDict = {'status' : 'ERROR',
						'description' : 'Insufficient parameters.'}	
		return HttpResponse(json.dumps(responseDict), mimetype='application/json', status=400)

	activities_found = NikeSportActivity.objects.filter(postal_code__in=zipCodes)[:5]

	activities_array = []
	for activity in activities_found:
		activities_array.append(activity.get_JSON())
	print activities_array
	responseDict = {'success' : 'OK',
					'parameters' : {'zipCodes' : zipCodes,
									'startTime' : startTime,
									'endTime' : endTime},
					'data' : {'activities': activities_array,
							  'count' : len(activities_array)}}	
	return HttpResponse(json.dumps(responseDict), mimetype='application/json')



# #loadSportFromZipcodeViewJSON?swLat=36.66560863153126&swLng=-125.43725519921873&neLat=38.174996763572814&neLng=-118.89489680078123



# 	sport_activty_data = NikeSportActivity.objects.all()[:1]
# 	return 0

# def NikeModelToJSON

# [<NikeSportActivity: e55fbb86-73ae-4467-9eaa-f97137be82cc>, 
# 	#params start time, end time, 
# 	#params 4 lat, lng pairs
# 	#geocoding. 


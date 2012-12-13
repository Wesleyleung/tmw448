from django.core.management import setup_environ
from os import environ
if environ.get('HEROKU', '') is 'yes':
	import nikeplusstanford.settings.prod
else:
	import nikeplusstanford.settings.dev
if environ.get('HEROKU', '') is 'yes':
	setup_environ(nikeplusstanford.settings.prod)
else:
	setup_environ(nikeplusstanford.settings.dev)
import argparse
import urllib2
import csv
import time
from datetime import datetime
from gevent import monkey
import gevent
import json

from nikeplusstanford.apps.fuelmapper.models import NikeSportActivity

def makeDBCall(zipcode):
	d1 = datetime.fromtimestamp(1349827200)
	d2 = datetime.fromtimestamp(1349913600)
	objects = NikeSportActivity.objects.filter(postal_code=zipcode).filter(start_time_local__gte=d1).filter(start_time_local__lte=d2).order_by('start_time_local')
	json = []
	for activity in objects:
		activity_JSON = activity.get_JSON()
	return json

def testConcurrentDB():
	monkey.patch_all()
	t1 = gevent.spawn(lambda: makeDBCall('94305'))
	t2 = gevent.spawn(lambda: makeDBCall('92620'))
	t1.join(); t2.join()
	v1, v2 = t1.value, t2.value
	v1.extend(v2)
	print json.dumps(v1, indent=4, separators=(',', ': '))

def main():
	# parser = argparse.ArgumentParser(description="File importer for activities from a csv file")
	# parser.add_argument('url', help='URL of the file to be imported')
	# args = parser.parse_args()
	
	testConcurrentDB()
	


if __name__ == '__main__':
	main()

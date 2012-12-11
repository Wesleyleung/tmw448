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

from nikeplusstanford.apps.fuelmapper.models import PostalCode

def importFromCSV(url):

	file_name = url.split('/')[-1]
	u = urllib2.urlopen(url)
	f = open(file_name, 'wb')
	meta = u.info()
	file_size = int(meta.getheaders("Content-Length")[0])
	print "Downloading: %s Bytes: %s" % (file_name, file_size)

	file_size_dl = 0
	block_sz = 8192
	while True:
	    buffer = u.read(block_sz)
	    if not buffer:
	        break

	    file_size_dl += len(buffer)
	    f.write(buffer)
	    status = r"%10d  [%3.2f%%]" % (file_size_dl, file_size_dl * 100. / file_size)
	    status = status + chr(8)*(len(status)+1)
	    print status,

	f.close()
	f = open(file_name, 'rb')
	csvDict = csv.DictReader(f)
	for line in csvDict:
		zipcode = line['Zipcode']
		if len(zipcode) == 5:
			postal_code = PostalCode.find_or_create_code(zipcode)
			while postal_code == None:
				time.sleep(1)
				postal_code = PostalCode.find_or_create_code(zipcode)
				print 'postal code from loop: %s' % postal_code
			print postal_code
			# time.sleep(1)


	f.close()
	remove(file_name)

def main():
	parser = argparse.ArgumentParser(description="File importer for activities from a csv file")
	parser.add_argument('url', help='URL of the file to be imported')
	args = parser.parse_args()
	
	importFromCSV(args.url)
	


if __name__ == '__main__':
	main()
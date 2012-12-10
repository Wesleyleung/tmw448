import csv
from apps.fuelmapper.models import NikeUser, NikeSportActivity
from datetime import datetime
from django.db import IntegrityError
from django.db.utils import DatabaseError
import urllib2
from os import remove

def oracleTimeToDateTime(timeString):
	'07-APR-12 12.00.00.000000000 AM'
	monthName = timeString[3:6]
	months = {'JAN' : '01', 'FEB' : '02', 'MAR' : '03', 'APR' : '04', 'MAY' : '05', 'JUN' : '06', 'JUL' : '07', 'AUG' : '08', 'SEP' : '09', 'OCT' : '10', 'NOV' : '11', 'DEC' : '12'}
	fixed = timeString[:3] + months[monthName] + timeString[6:18] + timeString[-3:]
	returnTime = datetime.strptime(fixed, '%d-%m-%y %I.%M.%S %p')
	return returnTime

def importActivitiesFromCSV(url):

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
	print csvDict
	print f
	print csvDict.fieldnames
	print 'File opened.'
	csvDict.fieldnames = [field.strip().lower() for field in csvDict.fieldnames]
	print 'Field names converted: %s' % str(csvDict.fieldnames)
	count = 0
	existingCount = 0
	errorCount = 0
	objects_to_bulk_create = []
	print 'Starting line iteration.'
	for line in csvDict:
		# unicode_line = dict([(k.encode('utf8'), v.encode('utf8')) for k, v in line.items()])
		newTime = oracleTimeToDateTime(line['start_time_local'])
		line['start_time_local'] = newTime
		newActivity = NikeSportActivity(**line)
		objects_to_bulk_create.append(newActivity)
		# if len(objects_to_bulk_create) >= 10:
		# 	try:
		# 		NikeSportActivity.objects.bulk_create(objects_to_bulk_create)
		# 		count += len(objects_to_bulk_create)
		# 		objects_to_bulk_create = []
		# 	except IntegrityError, e:
		# 		existingCount += len(objects_to_bulk_create)
		# 		objects_to_bulk_create = []
		# 		print 'IntegrityError during bulk save: %s' % str(e)
		# 	except DatabaseError, e:
		# 		errorCount += len(objects_to_bulk_create)
		# 		objects_to_bulk_create = []
		# 		print 'DatabaseError during bulk save: %s' % str(e)
		# 	print '%d rows completed. %d existing rows skipped. Error count: %d' % (count, existingCount, errorCount)
		try:
			newActivity.save()
			count += 1
		except IntegrityError:
			existingCount += 1
		except DatabaseError:
			errorCount += 1
		print '%d rows completed. %d existing rows skipped. Error count: %d                      \r' % (count, existingCount, errorCount),
		# if count % 10000 == 0 and count > 0:
		# 	print '%d rows completed.' % count
		# if existingCount % 10000 == 0 and existingCount > 0:
		# 	print '%d existing rows skipped.' % existingCount
	# if len(objects_to_bulk_create) > 0:
	# 		try:
	# 			NikeSportActivity.objects.bulk_create(objects_to_bulk_create)
	# 			count += len(objects_to_bulk_create)
	# 			objects_to_bulk_create = []
	# 		except IntegrityError, e:
	# 			existingCount += len(objects_to_bulk_create)
	# 			objects_to_bulk_create = []
	# 			print 'IntegrityError during bulk save: %s' % str(e)
	# 		except DatabaseError, e:
	# 			errorCount += len(objects_to_bulk_create)
	# 			objects_to_bulk_create = []
	# 			print 'DatabaseError during bulk save: %s' % str(e)
	print ''
	print 'Completed import of %d lines. %d objects already existed. Error count: %d' % (count, existingCount, errorCount)
	f.close()
	remove(file_name)

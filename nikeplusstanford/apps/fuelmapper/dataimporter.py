import csv
from apps.fuelmapper.models import NikeUser, NikeSportActivity
from datetime import datetime
from django.db import IntegrityError
from django.db.utils import DatabaseError

def oracleTimeToDateTime(timeString):
	'07-APR-12 12.00.00.000000000 AM'
	monthName = timeString[3:6]
	months = {'JAN' : '01', 'FEB' : '02', 'MAR' : '03', 'APR' : '04', 'MAY' : '05', 'JUN' : '06', 'JUL' : '07', 'AUG' : '08', 'SEP' : '09', 'OCT' : '10', 'NOV' : '11', 'DEC' : '12'}
	fixed = timeString[:3] + months[monthName] + timeString[6:18] + timeString[-3:]
	returnTime = datetime.strptime(fixed, '%d-%m-%y %I.%M.%S %p')
	return returnTime

def importActivitiesFromCSV(filepath):
	print 'Importing CSV: %s' % filepath
	csvDict = csv.DictReader(open(filepath, 'rU'))
	print 'File opened.'
	csvDict.fieldnames = [field.strip().lower() for field in csvDict.fieldnames]
	print 'Field names converted: %s' % str(csvDict.fieldnames)
	count = 0
	existingCount = 0
	errorCount = 0
	for line in csvDict:
		newTime = oracleTimeToDateTime(line['start_time_local'])
		line['start_time_local'] = newTime
		newActivity = NikeSportActivity(**line)
		try:
			newActivity.save()
			count += 1
		except IntegrityError:
			existingCount += 1
		except DatabaseError:
			errorCount += 1
		if count % 10000 == 0:
			print '%d rows completed.' % count
	print 'Completed import of %d lines. %d objects already existed. Error count: %d' % (count, existingCount, errorCount)

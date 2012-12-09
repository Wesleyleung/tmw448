import csv
from apps.fuelmapper.models import NikeUser, NikeSportActivity
from datetime import datetime

def oracleTimeToDateTime(timeString):
	'07-APR-12 12.00.00.000000000 AM'
	monthName = timeString[3:6]
	months = {'JAN' : '01', 'FEB' : '02', 'MAR' : '03', 'APR' : '04', 'MAY' : '05', 'JUN' : '06', 'JUL' : '07', 'AUG' : '08', 'SEP' : '09', 'OCT' : '10', 'NOV' : '11', 'DEC' : '12'}
	fixed = timeString[:3] + months[monthName] + timeString[6:18] + timeString[-3:]
	returnTime = datetime.strptime(fixed, '%d-%m-%y %I.%M.%S %p')
	return returnTime

def importFromCSV(filepath):
	csvDict = csv.DictReader(open(filepath, 'rU'))

	csvDict.fieldnames = [field.strip().lower() for field in csvDict.fieldnames]

	for line in csvDict:
		newTime = oracleTimeToDateTime(line['start_time_local'])
		line['start_time_local'] = newTime
		print line
		newActivity = NikeSportActivity(**line)
		newActivity.save()
		print newActivity

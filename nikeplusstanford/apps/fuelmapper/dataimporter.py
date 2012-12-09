import csv
from apps.fuelmapper.models import NikeUser, NikeSportActivity

def importFromCSV(filepath):
	csv_file = open(filepath, 'rb')
	for line in csv.DictReader(csv_file, delimiter=','):
		print line
		newActivity = NikeSportActivity(**line)
		print newActivity

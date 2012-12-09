from django.core.management import setup_environ
from os import environ
if environ.get('HEROKU', '') is 'yes':
	import nikeplusstanford.settings.prod
else:
	import nikeplusstanford.settings.dev
import argparse

def main():
	parser = argparse.ArgumentParser(description="File importer for activities from a csv file")
	parser.add_argument('filename', help='Name of the file to be imported')
	args = parser.parse_args()
	if environ.get('HEROKU', '') is 'yes':
		setup_environ(nikeplusstanford.settings.prod)
	else:
		setup_environ(nikeplusstanford.settings.dev)
	from apps.fuelmapper import dataimporter
	dataimporter.importActivitiesFromCSV(args.filename)


if __name__ == '__main__':
	main()

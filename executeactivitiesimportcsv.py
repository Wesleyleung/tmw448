from django.core.management import setup_environ
import nikeplusstanford.settings.dev

setup_environ(nikeplusstanford.settings.dev)
from apps.fuelmapper import dataimporter
dataimporter.importActivitiesFromCSV('import.csv')

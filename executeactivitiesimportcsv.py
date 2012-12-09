from django.core.management import setup_environ
import nikeplusstanford.settings.prod

setup_environ(nikeplusstanford.settings.prod)
from apps.fuelmapper import dataimporter
dataimporter.importActivitiesFromCSV('import.csv')

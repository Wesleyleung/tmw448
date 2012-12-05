from googlemaps import GoogleMaps
import json
import csv
import random
import time
random.seed()


cities = {}
gmaps = GoogleMaps('AIzaSyA0fbVwcr2LQZho14TG7BgNq3x5Cx53kw0')

citiesDB = open('zipcodes.csv', "rb")
reader = csv.reader(citiesDB)

# coordsList = []
# for row in reader:
# 	coords = {}
# 	coords['lat'] = float(row[0])
# 	coords['lng'] = float(row[1])
# 	weight = random.uniform(0,5)
# 	coordsList.append({"coords" : coords, "weight": weight})
# cities['locations'] = coordsList
# print cities
# citiesDB.close()

coordsList = []
for row in reader:
	coords = {}
	time.sleep(1)
	lat,lng = gmaps.address_to_latlng(row[0])
	print row[0],lat,lng
	coords['lat'] = lat
	coords['lng'] = lng
	weight = random.uniform(0,5)
	coordsList.append({"coords" : coords, "weight": weight})
cities['locations'] = coordsList
print cities
citiesDB.close()

f = open('locations.json', 'w')
f.write(json.dumps(cities))
f.close()

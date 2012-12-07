from googlemaps import GoogleMaps
import json
import csv
import random
import time
random.seed()

runs = {}
runList = []
for i in range(0, 75):
	run = {}
	run["startTime"] = random.uniform(0, 24)
	intervals = []
	randStartLat = random.uniform(37.7,37.8)
	randStartLng = random.uniform(-122.5, -122.38)

	randNumIntervals = random.randint(5, 100)

	for j in range(0, randNumIntervals):
		multiplier = random.uniform(0,2)
		deltaLat = random.uniform(-0.001*multiplier, 0.001*multiplier)
		deltaLng = random.uniform(-0.001*multiplier, 0.001*multiplier)
		randStartLat = randStartLat + deltaLat
		randStartLng = randStartLng + deltaLng
		randFuel = random.randint(1, 10)
		intervals.append({"lat": randStartLat, "lng": randStartLng, "fuel": randFuel})

	run["intervals"] = intervals
	runList.append(run)
runs["runs"] = runList
print runs

f = open('js/randomRuns.json', 'w')
f.write(json.dumps(runs))
f.close()

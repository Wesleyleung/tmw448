/** GLOBAL VARIABLES **/
var map;
var pathStrokeColor = "#FF0000";
var hoverStrokeColor = "#7EE569";
var infowindow;
var isPaused = true;
//These eight need to be reset whenever we get new data
var pathLocationsLoaded = false;
var coordsToBeGraphed = [];
var coordsAlreadyGraphed = [];
var polyLineArray = [];
var totalRuns = 0;
var runVisualizationsEnded = 0;
var numProgressIntervals = 0;

google.maps.event.addDomListener(window, 'load', function () {
	initialize();
});

function initialize() {
	var mapOptions = {
		zoom: 8,
		center: new google.maps.LatLng(37.424106,-122.166076),  //uncomment this later
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

	//Try HTML5 geolocation
	// if(navigator.geolocation) {
	// 	navigator.geolocation.getCurrentPosition(function(position) {
	// 	var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
	// 	var infowindow = new google.maps.InfoWindow({
	// 		map: map,
	// 		position: pos,
	// 		content: 'Location found using HTML5.'
	// 	});

	// 	map.setCenter(pos);
	// }, function() {
	// 	handleNoGeolocation(true);
	// 	});
	// } else {
	// // Browser doesn't support Geolocation
	// 	handleNoGeolocation(false);
	// }
	generateHeatMap();
}

function handleNoGeolocation(errorFlag) {
	if (errorFlag) {
		var content = 'Error: The Geolocation service failed.';
	} else {
		var content = 'Error: Your browser doesn\'t support geolocation.';
	}
	var options = {
		map: map,
		position: new google.maps.LatLng(37.424106,-122.166076),
		content: content
	};
	var infowindow = new google.maps.InfoWindow(options);
	map.setCenter(options.position);
}

function calculateStats(json) {
	for (var i = 0; i < json.runs.length; i++) {
		for(var j = 0; j < json.runs[i].intervals.length; j++) {
			numProgressIntervals ++;
		}
	}
	//number of polylines = num coordinates - 1
	numProgressIntervals --;
	tray.setNumProgressIntervals(numProgressIntervals);
	tray.setCurrentProgressInterval(0);
}

function loadPath() {
	$.getJSON("js/runs.json", function(json) {
		totalRuns = json.runs.length;
		if (!pathLocationsLoaded) calculateStats(json);
		for (var i = 0; i < totalRuns; i++) {
			if (!pathLocationsLoaded) {
				var pathLocations = [];
				var pathPolyline;
				var totalFuel = 0;
				for (var j = 0; j < json.runs[i].intervals.length; j++) {
					var interval = json.runs[i].intervals[j];
					totalFuel = totalFuel + interval.fuel;
					var dict = {lat: interval.lat, lng: interval.lng, fuel: totalFuel};
					pathLocations.push(dict);
				}
			} else {
				pathLocations = coordsToBeGraphed[i];
				//if(!coordsAlreadyGraphed[i].length) clearPolylines();
			}

			pathPolyline = new google.maps.Polyline({
				map: map,
				strokeColor: "#FF0000",
				strokeOpacity: 1.0,
				strokeWeight: 2
			});

			if (polyLineArray[i] != null && !coordsAlreadyGraphed[i].length) {
				polyLineArray[i].setMap(null);
			}

			//Instantiate empty arrays in each
			coordsToBeGraphed[i] = [];
			coordsAlreadyGraphed[i] = [];

			polyLineArray[i] = pathPolyline;
			drawPath(pathLocations, pathPolyline, i);	
		}
		pathLocationsLoaded = true;
	});
}

function clearPolylines() {
	for (var i = 0; i < polyLineArray.length; i++) {
		polyLineArray[i].setMap(null);
	}
}

function drawPath(pathLocations, pathPolyline, runNum) {
	var animationTimeout = 500;
	pathPolyline.text = pathLocations[pathLocations.length - 1].fuel + " total fuel";
	console.log(pathPolyline);

	google.maps.event.addListener(pathPolyline, 'mouseover', function(event) {
		polyMouseover(event, this);
	});
	google.maps.event.addListener(pathPolyline, 'mouseout', function(event) {
		polyMouseout(event, this);
	});
	google.maps.event.addListener(pathPolyline, 'click', function(event) {
		polyClick(event, this);
	});

	//Adds the coord to the pathArray
	//automatically graphs it when push is called
	function addNextPoint(coords) {
		var thisPathArray = pathPolyline.getPath();
		thisPathArray.push(new google.maps.LatLng(coords.lat, coords.lng));
		pathPolyline.setPath(thisPathArray);
		tray.animateProgressBarByInterval(1);
	};

	function animationLoop() {
		if (!isPaused) {
			//"pop" off of pathLocations
			var coords = pathLocations.splice(0, 1)[0];
			addNextPoint(coords);
			//"push" onto stack of paths that were graphed
			coordsAlreadyGraphed[runNum].push(coords);
			setTimeout(function() {
				if (pathLocations.length) {
					animationLoop();
				} else {
					runVisualizationsEnded ++;
					coordsToBeGraphed[runNum] = coordsAlreadyGraphed[runNum];
					coordsAlreadyGraphed[runNum] = [];
					console.log(coordsToBeGraphed[runNum]);
					if (runVisualizationsEnded == totalRuns) {
						//All runs have ended
						//set tray's play button to be paused
						tray.playAndPause(true);
						tray.setNumProgressIntervals(numProgressIntervals);
						tray.setCurrentProgressInterval(0);
						runVisualizationsEnded = 0;
					}
				}
			}, animationTimeout);
		} else {
			//The last coordinate added to coordsAlreadyGraphed will be graphed because of the timeout.
			//We also need that coordinate in the coordsToBeGraphed so we have a start point that is 
			//the end point of the last graphed coordinate
			var coordsNotGraphed = coordsAlreadyGraphed[runNum][coordsAlreadyGraphed[runNum].length - 1];
			//Add it back to pathLocations
			pathLocations.splice(0, 0, coordsNotGraphed);	
			//Set coordsToBeGraphed to the pathLocations that have not yet been graphed
			coordsToBeGraphed[runNum] = pathLocations;
		}
	}
	tray.setProgressBarPercentage(0);
	animationLoop();
}

// Called on mouse over for a poly path.
// Colors it to a highlight color.
function polyMouseover (event, path) {
	path.setOptions({
		strokeColor : hoverStrokeColor
	});
}

// Called on mouse over for a poly path.
// Resets to the default color.
function polyMouseout (event, path) {
	path.setOptions({
		strokeColor : pathStrokeColor
	});
}

function polyClick (event, path) {
	var contentString = "Hello " + path.text;

	if (infowindow) {
		infowindow.close();
		infowindow.content = contentString;
		infowindow.position = event.latLng;
	} else {
		infowindow = new google.maps.InfoWindow({
		content: contentString,
	    position: event.latLng
		});
	}
	infowindow.open(map);
}

function generateHeatMap() {
	$.getJSON("js/locations.json", function(json) {
		console.log(json);
		var heatMapData = [];
		var added = {}
		for (var i = 0; i < json.locations.length; i++) {
			var location = json.locations[i];
			var LatLng = new google.maps.LatLng(location.coords.lat, location.coords.lng)
			if (!added[LatLng]) {
				//added additional points for testing purposes
				// var delta = 0.0025;
				// var dictne = {location: new google.maps.LatLng(location.coords.lat+delta, location.coords.lng+delta), weight: location.weight};
				// var dictse = {location: new google.maps.LatLng(location.coords.lat+delta, location.coords.lng-delta), weight: location.weight};
				// var dictnw = {location: new google.maps.LatLng(location.coords.lat-delta, location.coords.lng+delta), weight: location.weight};
				// var dictsw = {location: new google.maps.LatLng(location.coords.lat-delta, location.coords.lng-delta), weight: location.weight};
				// heatMapData.push(dictne);
				// heatMapData.push(dictse);
				// heatMapData.push(dictnw);
				// heatMapData.push(dictsw);

				var dict = {location: LatLng , weight: location.weight};
				heatMapData.push(dict);
				added[LatLng] = true;
			}
		};
		var heatmap = new google.maps.visualization.HeatmapLayer({
			data: heatMapData
		});
		 heatmap.setOptions({
			dissipating: true,
			opacity:0.75,
			radius:20
		 });
		heatmap.setMap(map);
	 });
}

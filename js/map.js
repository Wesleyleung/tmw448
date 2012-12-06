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
var visFullyComplete = false;

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
	//generateBoundaries();
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
			/*If a run only has one point, it does not have a progress interval
			because it will be a point and not a line.  This also means that one
			point in each run should not count as a progress interval */
			if (j != 0) numProgressIntervals ++;
		}
	}
	tray.setNumProgressIntervals(numProgressIntervals);
	tray.setCurrentProgressInterval(0);
}

function resetAfterFullyVisualized() {
	resetPolylines();
	tray.setNumProgressIntervals(numProgressIntervals);
	tray.setCurrentProgressInterval(0);
	tray.setProgressBarPercentage(0);
	runVisualizationsEnded = 0;
	visFullyComplete = false;
}

function resetPolylines() {
	console.log(map);
	for (var i = 0; i < polyLineArray.length; i++) {
		polyLineArray[i].setMap(null);
		polyLineArray[i] = new google.maps.Polyline({
			map: map,
 	    	strokeOpacity: 1.0,
 	 	    strokeWeight: 2
		});
	}
	//polyLineArray = [];
}

function loadPath() {
	var minFuel = 0;
	var maxFuel = 100;
	if (pathLocationsLoaded) {
		if (visFullyComplete) resetAfterFullyVisualized();
		for (var i = 0; i < totalRuns; i++) {
			pathLocations = coordsToBeGraphed[i];
			drawPath(pathLocations, i, minFuel, maxFuel);	
		}
	} else {
		$.getJSON("js/runs.json", function(json) {
			totalRuns = json.runs.length;
			if (!pathLocationsLoaded) calculateStats(json);
			for (var i = 0; i < totalRuns; i++) {
				var pathLocations = [];
				polyLineArray[i] = new google.maps.Polyline({
					map: map,
		 	    	strokeOpacity: 1.0,
		 	 	    strokeWeight: 2
				});
				var totalFuel = 0;
				for (var j = 0; j < json.runs[i].intervals.length; j++) {
					var interval = json.runs[i].intervals[j];
					totalFuel = totalFuel + interval.fuel;  //can be reworked serverside
					var dict = {lat: interval.lat, lng: interval.lng, fuel: totalFuel};
					pathLocations.push(dict);
				}

				//This only executes when the vis has been fully played through
				//Clears all the polylines on the map

				//Instantiate empty arrays
				coordsToBeGraphed[i] = [];
				coordsAlreadyGraphed[i] = [];

				drawPath(pathLocations, i, minFuel, maxFuel);	
			}
			pathLocationsLoaded = true;
		});
	}
}


function generatePathColor(i, minFuel, maxFuel) {
	var delta = (maxFuel - minFuel) % i;

    // var gradient = [
    //       'rgba(0, 255, 255, 0)',
    //       'rgba(0, 255, 255, 1)',
    //       'rgba(0, 191, 255, 1)',
    //       'rgba(0, 127, 255, 1)',
    //       'rgba(0, 63, 255, 1)',
    //       'rgba(0, 0, 255, 1)',
    //       'rgba(0, 0, 223, 1)',
    //       'rgba(0, 0, 191, 1)',
    //       'rgba(0, 0, 159, 1)',
    //       'rgba(0, 0, 127, 1)',
    //       'rgba(63, 0, 91, 1)',
    //       'rgba(127, 0, 63, 1)',
    //       'rgba(191, 0, 31, 1)',
    //       'rgba(255, 0, 0, 1)'
    //     ];

       var gradient = [
          'rgba(0, 255, 255, 1)',
          'rgba(255, 0, 0, 1)'
        ];
        
	return gradient[i];
}

function drawPath(pathLocations, runNum, minFuel, maxFuel) {
	var animationTimeout = 500;
	// var pathPolyline = new google.maps.Polyline({
	// 			map: map,
	// 			strokeColor: "#FF0000",
	// 			strokeOpacity: 1.0,
	// 			strokeWeight: 2
	// });

	var thisColor = rgbForGradientValue(minFuel, maxFuel, pathLocations[pathLocations.length - 1].fuel, {r: 255, g: 0, b: 0}, {r: 0, g: 0, b: 255});
	console.log("this color: " + thisColor);

	var pathPolyline = polyLineArray[runNum];
	pathPolyline.setOptions({strokeColor: thisColor});

	pathPolyline.text = pathLocations[pathLocations.length - 1].fuel + " total fuel";

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
		var incr = 1;
		if (thisPathArray.length < 2) incr = 0;
		tray.animateProgressBarByInterval(incr);
	};

	function animationLoop() {
		if (!isPaused) {
			//"pop" off of pathLocations
			var coords = pathLocations.splice(0, 1)[0];
			addNextPoint(coords);
			//"push" onto stack of coords that were graphed
			coordsAlreadyGraphed[runNum].push(coords);
			setTimeout(function() {
				if (pathLocations.length) {
					animationLoop();
				} else {
					runVisualizationsEnded ++;
					coordsToBeGraphed[runNum] = coordsAlreadyGraphed[runNum];
					coordsAlreadyGraphed[runNum] = [];
					if (runVisualizationsEnded == totalRuns) {
						//All runs have ended
						//set tray's play button to be paused
						tray.playAndPause(true);
						visFullyComplete = true;
					}
				}
			}, animationTimeout);
		} else {
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

// function generateBoundaries() {
// 	$.getJSON("js/zipcodes.json", function(json) {
// 		for(var i = 0; i < json.zipcodes.length; i++) {
// 			var zipcode = json.zipcodes[i];
// 			var requestUrl = "http://www.propertymaps.com/maps/xml/county.php?zip=" + zipcode;
// 			$.ajax(requestUrl, {
// 				dataType: "xml",
// 				//data: data,
// 				success: function(data) {
// 					console.log(data);
// 				},
// 				error: function() {
// 					//alert("Oops something went wrong.");
// 				}
// 			});
// 		}
// 	});
// }

function generateHeatMap() {
	$.getJSON("js/locations.json", function(json) {
		//console.log(json);
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
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
	}
	polyLineArray = [];
}

function loadPath() {
	var minFuel = 0;
	var maxFuel = 100;
	if (pathLocationsLoaded) {
		if (visFullyComplete) resetAfterFullyVisualized();
		console.log("paths loaded already");
		for (var i = 0; i < totalRuns; i++) {
			pathLocations = coordsToBeGraphed[i];
			drawPath(pathLocations, i, minFuel, maxFuel);	
		}
	} else {
		console.log("paths loading");
		$.getJSON("js/runs.json", function(json) {
			totalRuns = json.runs.length;
			if (!pathLocationsLoaded) calculateStats(json);
			for (var i = 0; i < totalRuns; i++) {
				var pathLocations = [];
				var pathPolyline;
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

	var pathPolyline = new google.maps.Polyline({
		map: map,
		strokeColor: thisColor,
		strokeOpacity: 1.0,
		strokeWeight: 2
	});

	pathPolyline.text = pathLocations[pathLocations.length - 1].fuel + " total fuel";
	polyLineArray.push(pathPolyline);

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


// RGB is a dict with keys ['r', 'g', 'b']
function RGB2HSV (RGB) {
    var HSV = {h : 0.0, s : 0.0, v : 0.0};

    r = RGB.r / 255; g = RGB.g / 255; b = RGB.b / 255; // Scale to unity.

	var minVal = Math.min(r, g, b);
	var maxVal = Math.max(r, g, b);
	var delta = maxVal - minVal;

	HSV.v = maxVal;

	if (delta == 0) {
		HSV.h = 0;
		HSV.s = 0;
	} else {
		HSV.s = delta / maxVal;
		var del_R = (((maxVal - r) / 6) + (delta / 2)) / delta;
		var del_G = (((maxVal - g) / 6) + (delta / 2)) / delta;
		var del_B = (((maxVal - b) / 6) + (delta / 2)) / delta;

		if (r == maxVal) {HSV.h = del_B - del_G;}
		else if (g == maxVal) {HSV.h = (1 / 3) + del_R - del_B;}
		else if (b == maxVal) {HSV.h = (2 / 3) + del_G - del_R;}
		
		if (HSV.h < 0) {HSV.h += 1;}
		if (HSV.h > 1) {HSV.h -= 1;}
	}
	HSV.h *= 360;
	HSV.s *= 100;
	HSV.v *= 100
    return HSV;
}

function HSV2RGB (HSV) {
 	var RGB = {r : 0.0, g : 0.0, b : 0.0};
	var h = HSV.h / 360; var s = HSV.s / 100; var v = HSV.v / 100;
	if (s == 0) {
		RGB.r = v * 255;
		RGB.g = v * 255;
		RGB.b = v * 255;
	} else {
		var_h = h * 6;
		var_i = Math.floor(var_h);
		var_1 = v * (1 - s);
		var_2 = v * (1 - s * (var_h - var_i));
		var_3 = v * (1 - s * (1 - (var_h - var_i)));
		
		if (var_i == 0) {var_r = v; var_g = var_3; var_b = var_1}
		else if (var_i == 1) {var_r = var_2; var_g = v; var_b = var_1}
		else if (var_i == 2) {var_r = var_1; var_g = v; var_b = var_3}
		else if (var_i == 3) {var_r = var_1; var_g = var_2; var_b = v}
		else if (var_i == 4) {var_r = var_3; var_g = var_1; var_b = v}
		else {var_r = v; var_g = var_1; var_b = var_2};
		
		RGB.r = var_r * 255;
		RGB.g = var_g * 255;
		RGB.b = var_b * 255;
	}
	return RGB;
}

function rgbForGradientValue(minValue, maxValue, thisValue, minColorRGB, maxColorRGB) {
    var distance = (thisValue - minValue) / (maxValue - minValue);
    if (distance < 0) distance = 0;
    if (distance > 1) distance = 1;
    var minHSV = RGB2HSV(minColorRGB);
    var maxHSV = RGB2HSV(maxColorRGB);
    var thisHSV = {h: 0.0, s: 0.0, v: 0.0};
    thisHSV.h = (distance * (maxHSV.h - minHSV.h)) + minHSV.h;
    thisHSV.s = (distance * (maxHSV.s - minHSV.s)) + minHSV.s;
    thisHSV.v = (distance * (maxHSV.v - minHSV.v)) + minHSV.v;
    var thisRGB = HSV2RGB(thisHSV);
    return stringForRGB(thisRGB);
 }

 function stringForRGB(RGB) {
 	return 'rgba(' + Math.floor(RGB.r) + ', ' + Math.floor(RGB.g) + ', ' + Math.floor(RGB.b) + ', 1.0)';
 }

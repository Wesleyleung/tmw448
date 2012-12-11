/** GLOBAL VARIABLES **/
var map;
var heatmap;
var pathStrokeColor = "#FF0000";
var hoverStrokeColor = "#7EE569";
var infowindow;
var isPaused = true;
var marker = null;
//These eight need to be reset whenever we get new data
var pathLocationsLoaded = false;
var coordsToBeGraphed = [];
var coordsAlreadyGraphed = [];
var polyLineArray = [];
var totalRuns = 0;
var runVisualizationsEnded = 0;
var numProgressIntervals = 0;
var visFullyComplete = false;
var global_heat_data = null;


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

	google.maps.event.addListenerOnce(map, 'idle', function() {
		//generateHeatMap();	
	});
	
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
 	    	strokeOpacity: 0.5,
 	 	    strokeWeight: 2
		});

		google.maps.event.addListener(polyLineArray[i], 'mouseover', function(event) {
			polyMouseover(event, this);
		});
		google.maps.event.addListener(polyLineArray[i], 'mouseout', function(event) {
			polyMouseout(event, this);
		});
		google.maps.event.addListener(polyLineArray[i], 'click', function(event) {
			polyClick(event, this);
		});
	}
	//polyLineArray = [];
}

function loadPathsFromJSON(path, minFuel, maxFuel) {
	$.getJSON(path, function(json) {
		totalRuns = json.runs.length;
		console.log("total runs:" + totalRuns);
		if (!pathLocationsLoaded) calculateStats(json);
		for (var i = 0; i < totalRuns; i++) {
			var pathLocations = [];
			polyLineArray[i] = new google.maps.Polyline({
				map: map,
	 	    	strokeOpacity: 0.5,
	 	 	    strokeWeight: 2
			});

			google.maps.event.addListener(polyLineArray[i], 'mouseover', function(event) {
				polyMouseover(event, this);
			});
			google.maps.event.addListener(polyLineArray[i], 'mouseout', function(event) {
				polyMouseout(event, this);
			});
			google.maps.event.addListener(polyLineArray[i], 'click', function(event) {
				polyClick(event, this);
			});

			var totalFuel = 0;
			for (var j = 0; j < json.runs[i].intervals.length; j++) {
				var interval = json.runs[i].intervals[j];
				totalFuel = totalFuel + interval.fuel;  //can be reworked serverside
				var dict = {lat: interval.lat, lng: interval.lng, fuel: totalFuel};
				pathLocations.push(dict);
			}

			//Instantiate empty arrays
			coordsToBeGraphed[i] = [];
			coordsAlreadyGraphed[i] = [];

			drawPath(pathLocations, i, minFuel, maxFuel);	
		}
		pathLocationsLoaded = true;
	});
}

function graphPaths() {
	//Gets unix time from tray selector
	console.log(start_date.getTime()/1000);
	console.log(end_date.getTime()/1000);

	var minFuel = 0;
	var maxFuel = 600;
	if (pathLocationsLoaded) {
		if (visFullyComplete) resetAfterFullyVisualized();
		for (var i = 0; i < totalRuns; i++) {
			pathLocations = coordsToBeGraphed[i];
			drawPath(pathLocations, i, minFuel, maxFuel);	
		}
	} else {
		loadPathsFromJSON("loadStaticJSON?json_file=randomRuns.json", minFuel, maxFuel);
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

	var thisColor = rgbForGradientValue(minFuel, maxFuel, pathLocations[pathLocations.length - 1].fuel, {r: 255, g: 0, b: 0}, {r: 0, g: 0, b: 255});
	console.log("this color: " + thisColor);

	var pathPolyline = polyLineArray[runNum];
	pathPolyline.setOptions({strokeColor: thisColor});

	pathPolyline.text = pathLocations[pathLocations.length - 1].fuel + " total fuel";

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
		strokeOpacity: 1.0,
    	strokeWeight: 4
	});
}

// Called on mouse over for a poly path.
// Resets to the default color.
function polyMouseout (event, path) {
	console.log("this path: " + path);
	path.setOptions({
		strokeOpacity: 0.5,
    	strokeWeight: 2
		
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
function toggleHeatmap() {
 		console.log("heat map toggled");
        heatmap.setMap(heatmap.getMap() ? null : map);    
}

//Set a marker on the location searched
function setMarkerAtLatLng(ll) {
	//clear old marker
	if (marker) marker.setMap(null);
	//set marker to location
	marker = new google.maps.Marker({
		map:map,
		draggable:false,
		clickable:false,
		animation: google.maps.Animation.DROP,
		position: ll
	});
}


function searchLocation() {
	if (!this.searchInput) this.searchInput = $('#search-input');
	console.log(this.searchInput.val());
	var geocoder = new google.maps.Geocoder();
	geocoder.geocode({'address':this.searchInput.val()}, function (results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			var resType = results[0].geometry.location_type;
			var res = results[0].geometry.location;
			var LatLng = new google.maps.LatLng(res.lat(), res.lng());
			var geocoder2 = new google.maps.Geocoder();
			geocoder2.geocode({ 'latLng': LatLng, 'region': 'US' }, function (results, status) {
				console.log(results[0]);
			});
			console.log(results[0]);
			//If it's a rooftop location, set zoom to fairly high
			//If there are no bounds, we can't use the function setLocationOnMapByBounds
			if (resType == 'ROOFTOP' || !results[0].geometry.bounds) {
				setLocationOnMapByLatLng(LatLng);
				var maxZoomService = new google.maps.MaxZoomService();
				maxZoomService.getMaxZoomAtLatLng(LatLng, function(response) {
				    if (response.status != google.maps.MaxZoomStatus.OK) {
						return;
					} else {
						if (results[0].geometry.bounds) setMapZoom(response.zoom - 2);
						else setMapZoom(response.zoom - 5);
					}
					setMarkerAtLatLng(LatLng);
				});
			//if not, just set by the boundaries
			} else {
				setLocationOnMapByBounds(results[0].geometry.bounds);
				setMarkerAtLatLng(LatLng);
			}
			
		} else {
			if (!results.length) {
				modal.showModal("Location Not Found", '<p>Your search for "' + this.searchInput.val() + '" did not return any results.  Please search for another location.</p>');
			}
		}
	});
	geocoder = null;
}

/*
headerText is only text and bodyText can include html
*/
function showModal(headerText, bodyText, includeFooter) {
	this.modal = $('#myModal');
	this.modalHeader = this.modal.find('.modal-header h3');
	this.modalBody = this.modal.find('.modal-body');
	this.modalFooter = this.modal.find('.modal-footer');
	this.modalHeader.html(headerText);
	this.modalBody.html(bodyText);

	//defaults to true
	if (typeof(includeFooter) === 'undefined' || includeFooter) {
		if (!this.modalFooter.length) {
			this.modalBody.after(
				'<div class="modal-footer">\
        			<button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>\
     			 </div>'
			)
		}
	} else if (!includeFooter) {
		this.modalFooter.remove();
	}

	this.modal.modal();
}

function setLocationOnMapByBounds(bounds) {
	map.setCenter(bounds.getCenter());
	map.fitBounds(bounds);
}

function setLocationOnMapByLatLng(latLng) {
	map.setCenter(latLng);
}

function setMapZoom(zoom) {
	map.setZoom(zoom);
}

function generateHeatMap(callback) {
	var heatMapData = [];
	for (var i = 0; i < global_heat_data.data.count; i++) {
		fuel_amt = global_heat_data.data.activities[i].fuel_amt;
		lat = global_heat_data.data.activities[i].postal_code.geometry.location.lat;
		lng = global_heat_data.data.activities[i].postal_code.geometry.location.lng;
		start_time = global_heat_data.data.activities[i].start_time_standard;
		var LatLng = new google.maps.LatLng(lat, lng)
		var dict = {location: LatLng, weight: fuel_amt};
		heatMapData.push(dict);
	}

	heatmap = new google.maps.visualization.HeatmapLayer({
		data: heatMapData
	});

	heatmap.setOptions({
		dissipating: true,
		opacity:0.75,
		radius:15
	});
	heatmap.setMap(map);
}

function getHeatMapModel(callback) {
	var start_time = new Date($("#start_date").val()).getTime()/1000;
	var end_time = new Date($("#end_date").val()).getTime()/1000;
	var center = map.getCenter();
    var maxRows = 10;
    var radius = 5;
   		
    $.get( "loadSportFromZipcodeViewJSON",
    	{lat: center.lat(), lng: center.lng(), radius: radius, maxRows: maxRows, startTime: start_time, endTime: end_time},
    	function(data) {
    		if(data.success == "OK" && data.data.count > 0) {   	
	    		global_heat_data = data;
	    		callback(data);
    		}
    	}
    );
}





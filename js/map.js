var map;
var pathStrokeColor = "#FF0000";
var hoverStrokeColor = "#7EE569";
var infowindow;

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

function loadPath() {
	$.getJSON("js/runs.json", function(json) {
		for (var i = 0; i < json.runs.length; i++) {
			var pathLocations = [];
			var pathPolyline;
			var totalFuel = 0;
			for (var j = 0; j < json.runs[i].intervals.length; j++) {
				var interval = json.runs[i].intervals[j];
				totalFuel = totalFuel + interval.fuel;
				var dict = {lat: interval.lat, lng: interval.lng, fuel: totalFuel};
				pathLocations.push(dict);
			}
			pathPolyline = new google.maps.Polyline({
				map: map,
				strokeColor: "#FF0000",
				strokeOpacity: 1.0,
				strokeWeight: 2
			});
			drawPath(pathLocations, pathPolyline);	
		}
	});
}

function drawPath(pathLocations, pathPolyline) {
	var animationTimeout = 500;
	pathPolyline.text = pathLocations[pathLocations.length-1].fuel + " total fuel";
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

	function addNextPoint(coords) {
		var thisPathArray = pathPolyline.getPath();
		thisPathArray.push(new google.maps.LatLng(coords.lat, coords.lng));
		pathPolyline.setPath(thisPathArray);
	};

	var animationIndex = 0;
	function animationLoop() {
		var coords = pathLocations[animationIndex];
		addNextPoint(coords);
		setTimeout(function() {
			animationIndex++;
			if (animationIndex < pathLocations.length) {
				animationLoop();
			};
		}, animationTimeout);
	}
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
		for (var i = 0; i < json.locations.length; i++) {
			var location = json.locations[i];
			var dict = {location: new google.maps.LatLng(location.coords.lat, location.coords.lng), weight: location.weight};
			heatMapData.push(dict);
		};
		var heatmap = new google.maps.visualization.HeatmapLayer({
			data: heatMapData
		});
		 heatmap.setOptions({
			opacity:0.5,
			radius:20
		 });
		heatmap.setMap(map);
	 });
}

google.maps.event.addDomListener(window, 'load', function () {
	initialize();
});


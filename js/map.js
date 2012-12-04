var map;

var pathArray;
var pathPolyline;

var pathStrokeColor = "#FF0000";
var hoverStrokeColor = "#7EE569";

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
	console.log("end of initialize");
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
	// Create the MVC array to hold the path points, push an object on
	// to make the path polyline happy.
	pathArray = new google.maps.MVCArray();
	pathArray.push(new google.maps.LatLng());
	console.log("initialized path array");

	pathPolyline = new google.maps.Polyline({
		map: map,
		strokeColor: pathStrokeColor,
		strokeOpacity: 1.0,
		strokeWeight: 4.0
	});

	google.maps.event.addListener(pathPolyline, 'mouseover', function(event) {
		polyMouseover(event, this);
	});
	google.maps.event.addListener(pathPolyline, 'mouseout', function(event) {
		polyMouseout(event, this);
	});

	// After setting the path to the polyline, pop the filler object off.
	// pathPolyline.setPath(pathArray);
	pathArray.pop();

	// dummy JSON
	var pathLocations = [{lat: 37.424106, lng: -122.166076},
					 {lat: 37.77493, lng: -122.419415},
					 {lat: 37.339386, lng: -121.894955}];

	var animationTimeout = 500;

	function addNextPoint(coords) {
		var thisPathArray = pathPolyline.getPath();
		thisPathArray.push(new google.maps.LatLng(coords.lat, coords.lng));
		pathPolyline.setPath(thisPathArray);
		console.log(thisPathArray);
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

	// for (var i = 0; i < pathLocations.length; i++) {

	// 	var coords = pathLocations[i];
		
	// 	balls(pathPolyline);
	// 	// setTimeout(function(){balls(pathPolyline)}, 2000);
	// }
}

function polyMouseover (event, path) {
	console.log(event);
	path.setOptions({
		strokeColor : hoverStrokeColor
	});
}

function polyMouseout (event, path) {
	console.log(event);
	path.setOptions({
		strokeColor : pathStrokeColor
	});
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


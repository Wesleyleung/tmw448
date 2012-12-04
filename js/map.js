var map;

var pathArray;
var pathPolyline;

var heatMapData = {locations : [{coords: {lat: 37.782, lng: -122.447}, weight: 0.5},
					             {coords: {lat: 37.782, lng: -122.443}, weight: 1},
					             {coords: {lat: 37.782, lng: -122.441}, weight: 2},
					             {coords: {lat: 37.782, lng: -122.439}, weight: 3},
					             {coords: {lat: 37.782, lng: -122.437}, weight: 2},
					             {coords: {lat: 37.782, lng: -122.435}, weight: 1},
					             {coords: {lat: 37.785, lng: -122.447}, weight: 0.5},
					             {coords: {lat: 37.785, lng: -122.445}, weight: 3},
					             {coords: {lat: 37.785, lng: -122.441}, weight: 2},
					             {coords: {lat: 37.785, lng: -122.437}, weight: 1},
					             {coords: {lat: 37.785, lng: -122.435}, weight: 3}]};

// var heatMapData = [
//   {location: new google.maps.LatLng(37.782, -122.447), weight: 0.5},
//   new google.maps.LatLng(37.782, -122.445),
//   {location: new google.maps.LatLng(37.782, -122.443), weight: 2},
//   {location: new google.maps.LatLng(37.782, -122.441), weight: 3},
//   {location: new google.maps.LatLng(37.782, -122.439), weight: 2},
//   new google.maps.LatLng(37.782, -122.437),
//   {location: new google.maps.LatLng(37.782, -122.435), weight: 0.5},

//   {location: new google.maps.LatLng(37.785, -122.447), weight: 3},
//   {location: new google.maps.LatLng(37.785, -122.445), weight: 2},
//   new google.maps.LatLng(37.785, -122.443),
//   {location: new google.maps.LatLng(37.785, -122.441), weight: 0.5},
//   new google.maps.LatLng(37.785, -122.439),
//   {location: new google.maps.LatLng(37.785, -122.437), weight: 2},
//   {location: new google.maps.LatLng(37.785, -122.435), weight: 3}
// ];

function initialize() {
  var mapOptions = {
    zoom: 8,
  	mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById('map_canvas'),
  		mapOptions);

  // Try HTML5 geolocation
  if(navigator.geolocation) {
  	navigator.geolocation.getCurrentPosition(function(position) {
  		var pos = new google.maps.LatLng(position.coords.latitude,
  																		 position.coords.longitude);

  		var infowindow = new google.maps.InfoWindow({
  			map: map,
  			position: pos,
  			content: 'Location found using HTML5.'
  		});

  		map.setCenter(pos);
  	}, function() {
  		handleNoGeolocation(true);
  	});
  } else {
  	// Browser doesn't support Geolocation
  	handleNoGeolocation(false);
  }
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

// console.log("before function");

// $.getJSON('js/locations.json', function(json) {
// 	console.log("in function");
	// console.log(json);
	// var heatMapData = [];
	// for (var i = 0; i < json.locations.length; i++) {
	// 	var location = json.locations[i];
	// 	var dict = {location: new google.maps.LatLng(location.coords.lat, location.coords.lng), weight: location.weight};
	// 	heatMapData.push(dict);
	// };
	// console.log(heatMapData);
	// var heatmap = new google.maps.visualization.HeatmapLayer({
	//   data: heatMapData
	// });
	// heatmap.setMap(map);
// });

var dataArray = [];
for (var i = 0; i < heatMapData.locations.length; i++) {
	var location = heatMapData.locations[i];
	var dict = {location: new google.maps.LatLng(location.coords.lat, location.coords.lng), weight: location.weight};
	dataArray.push(dict);
};
console.log(heatMapData);
var heatmap = new google.maps.visualization.HeatmapLayer({
  data: dataArray
});
heatmap.setOptions({
	opacity:0.5,
	radius:20
});
heatmap.setMap(map);

console.log("end of initialize");

setTimeout(loadPath(), 2000);

}

google.maps.event.addDomListener(window, 'load', function () {
	initialize();
});

function loadPath() {

	// Create the MVC array to hold the path points, push an object on
	// to make the path polyline happy.
	pathArray = new google.maps.MVCArray();
	pathArray.push(new google.maps.LatLng());
	console.log("initialized path array");

	pathPolyline = new google.maps.Polyline({
		map: map,
		strokeColor: "#FF0000",
	    strokeOpacity: 1.0,
	    strokeWeight: 2
	});

	// After setting the path to the polyline, pop the filler object off.
	pathPolyline.setPath(pathArray);
	pathArray.pop();

	// dummy JSON
var pathLocations = [{lat: 37.424106, lng: -122.166076},
					 {lat: 37.77493, lng: -122.419415},
					 {lat: 37.339386, lng: -121.894955}];

for (var i = 0; i < pathLocations.length; i++) {
	console.log(pathLocations);
	var coords = pathLocations[i];
	setTimeout(pathArray.push(new google.maps.LatLng(coords.lat, coords.lng)), 2000);
}
}

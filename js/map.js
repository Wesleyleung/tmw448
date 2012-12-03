var map;

var heatMapData = [
  {location: new google.maps.LatLng(37.782, -122.447), weight: 0.5},
  new google.maps.LatLng(37.782, -122.445),
  {location: new google.maps.LatLng(37.782, -122.443), weight: 2},
  {location: new google.maps.LatLng(37.782, -122.441), weight: 3},
  {location: new google.maps.LatLng(37.782, -122.439), weight: 2},
  new google.maps.LatLng(37.782, -122.437),
  {location: new google.maps.LatLng(37.782, -122.435), weight: 0.5},

  {location: new google.maps.LatLng(37.785, -122.447), weight: 3},
  {location: new google.maps.LatLng(37.785, -122.445), weight: 2},
  new google.maps.LatLng(37.785, -122.443),
  {location: new google.maps.LatLng(37.785, -122.441), weight: 0.5},
  new google.maps.LatLng(37.785, -122.439),
  {location: new google.maps.LatLng(37.785, -122.437), weight: 2},
  {location: new google.maps.LatLng(37.785, -122.435), weight: 3}
];

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

var heatmap = new google.maps.visualization.HeatmapLayer({
  data: heatMapData
});
heatmap.setMap(map);

}

google.maps.event.addDomListener(window, 'load', initialize);
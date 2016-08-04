var map = L.map('map').setView([34, 43], 6);

/* L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', 
    {maxZoom: 18}).addTo(map); */
	
L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibHVrYXN6a3J1ayIsImEiOiJjaWlyOHhna2gwMmp2dTFrcGhmY3Z5NWgzIn0.8J8YJkhUxbP6jmB6VK4RLw').addTo(map);	
	
var geojsonLayer = new L.GeoJSON();

function handleJson(data) {
	console.log(data);
	geojsonLayer.addData(data);
}

//need to enable JSONP in geoserver first 

$.ajax({
	url: "http://localhost:8080/geoserver/ows?service=wfs&version=2.0.0&request=GetFeature&typeNames=workspace1:view&outputFormat=text/javascript&count=10&format_options=callback:getJson",
	dataType : 'jsonp',
	jsonpCallback: 'getJson',
	success: handleJson
});

map.addLayer(geojsonLayer);
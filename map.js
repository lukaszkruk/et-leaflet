var map = L.map('map').setView([33.5, 43], 6);

// add background
L.tileLayer('https://api.mapbox.com/styles/v1/lukaszkruk/cirgbygyt001bh5kp7bessgd4/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibHVrYXN6a3J1ayIsImEiOiJjaWlyOHhna2gwMmp2dTFrcGhmY3Z5NWgzIn0.8J8YJkhUxbP6jmB6VK4RLw').addTo(map);	
	
//add point layer from geoserver
//need to enable JSONP in geoserver first 

var geojsonLayer = new L.GeoJSON();

function handleJson(data) {
//	console.log(data);
	geojsonLayer.addData(data);
}

$.ajax({
	url: "http://localhost:8080/geoserver/ows?service=wfs&version=2.0.0&request=GetFeature&typeNames=workspace1:view&outputFormat=text/javascript&count=100&format_options=callback:getJson",
	dataType : 'jsonp',
	jsonpCallback: 'getJson',
	success: handleJson
});

map.addLayer(geojsonLayer);

// add heatmap from geoserver

// L.tileLayer.wms('http://localhost:8080/geoserver/wms?', {
    // layers: 'workspace1:view-rasterised',
	// format: 'image/png',
	// transparent: true,
	// tiled: false
// }).addTo(map);

var map = L.map('map').setView([33.5, 43], 6);

// add background
L.tileLayer('https://api.mapbox.com/styles/v1/lukaszkruk/cirgbygyt001bh5kp7bessgd4/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibHVrYXN6a3J1ayIsImEiOiJjaWlyOHhna2gwMmp2dTFrcGhmY3Z5NWgzIn0.8J8YJkhUxbP6jmB6VK4RLw').addTo(map);	
	
//add point layer from geoserver
//need to enable JSONP in geoserver first 

var geojsonLayer = new L.GeoJSON();
var pointFeatures = [];
var maxIntensity;

function handleJson(data) {
	geojsonLayer.addData(data);
		
	for (var i = 0; i < data.features.length; i++) {
		temp_array = [];

			temp_array.push(
				data.features[i].properties.Latitude,
				data.features[i].properties.Longitude,
				data.features[i].properties.IDPfamilies
			);
			pointFeatures.push(temp_array);
	};
	
	// find the point with largest intensity 
	
	intensities = [];
	
	for (var i = 0; i < data.features.length; i++) {
		intensities.push(data.features[i].properties.IDPfamilies)
	};
	
	// console.log(intensities);
	maxIntensity = Math.max.apply(Math, intensities);
	
	console.log(maxIntensity);
};

$.ajax({
	url: "http://localhost:8080/geoserver/ows?service=wfs&version=2.0.0&request=GetFeature&typeNames=workspace1:view&outputFormat=text/javascript&count=100&format_options=callback:getJson",
	dataType : 'jsonp',
	jsonpCallback: 'getJson',
	success: handleJson
});

// map.addLayer(geojsonLayer);

var heat = L.heatLayer(pointFeatures, {radius: 15}).addTo(map);

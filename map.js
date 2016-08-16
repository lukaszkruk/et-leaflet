var map = new L.Map('map').setView([33.5, 43], 6);

// add background
var baseLayer = L.tileLayer(
'https://api.mapbox.com/styles/v1/lukaszkruk/cirgbygyt001bh5kp7bessgd4/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibHVrYXN6a3J1ayIsImEiOiJjaWlyOHhna2gwMmp2dTFrcGhmY3Z5NWgzIn0.8J8YJkhUxbP6jmB6VK4RLw').addTo(map);	
	
// make point layer (don't add to display)
var geojsonLayer;
// make data placeholder for heatmap
var pointFeatures = {max: 8, data:[]};
// make heatmap layer
var cfg = {
  // radius should be small ONLY if scaleRadius is true (or small radius is intended)
  // if scaleRadius is false it will be the constant radius used in pixels
  "radius": 14,
  "minOpacity": .05, 
  "maxOpacity": .7, 
  // scales the radius based on map zoom
  "scaleRadius": false, 
  // if set to false the heatmap uses the global maximum for colorization
  // if activated: uses the data maximum within the current map boundaries 
  //   (there will always be a red spot with useLocalExtremas true)
  "useLocalExtrema": true,
  latField: 'lat',
  lngField: 'lng',
  valueField: 'count'
};

var heatmapLayer = new HeatmapOverlay(cfg).addTo(map);

function handleJson(data) {
  // populate point layer

  var geojsonMarkerOptions = {
    radius: 4,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.6
  };

  geojsonLayer = L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng, geojsonMarkerOptions);
    },
    onEachFeature: function(feature, layer) {
      layer.bindPopup("Families: " + feature.properties.IDPfamilies);
    }
  });
  // populate heatmap layer
  for (i in data.features) {
    point = {
      lat: data.features[i].properties.Latitude,
      lng: data.features[i].properties.Longitude,
      count: data.features[i].properties.IDPfamilies
    };
    pointFeatures.data.push(point);
  };
  heatmapLayer.setData(pointFeatures);

  L.control.layers({
    "Density": heatmapLayer,
    "Points": geojsonLayer
  }, null, {
    collapsed: false
  }).addTo(map);
};


//grab points from geoserver - need to enable JSONP in geoserver first 
$.ajax({
	url: "http://localhost:8080/geoserver/ows?service=wfs&version=2.0.0&request=GetFeature&typeNames=workspace1:view&outputFormat=text/javascript&count=1000&format_options=callback:getJson",
	dataType : 'jsonp',
	jsonpCallback: 'getJson',
	success: handleJson
});

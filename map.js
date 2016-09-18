var map = new L.Map('map').setView([33.5, 43], 6);

var governorates = ["Anbar","Babylon", "Baghdad", "Basrah", "Dahuk", "Diyala", "Erbil", "Kerbala", "Kirkuk", "Missan", "Muthanna", "Najaf", "Ninewa", "Qadissiya", "SalahalDin", "Sulaymaniyah", "ThiQar", "Wassit"];

var satLayer = L.tileLayer(
  'https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibHVrYXN6a3J1ayIsImEiOiJjaWlyOHhna2gwMmp2dTFrcGhmY3Z5NWgzIn0.8J8YJkhUxbP6jmB6VK4RLw', 
  {attribution: "Basemap &copy; <a href='https://www.mapbox.com/map-feedback/'>Mapbox</a> &copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> &copy; <a href='https://www.digitalglobe.com/'>DigitalGlobe</a>"}
  );

var baseLayer = L.tileLayer(
  'https://api.mapbox.com/styles/v1/lukaszkruk/cirgbygyt001bh5kp7bessgd4/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibHVrYXN6a3J1ayIsImEiOiJjaWlyOHhna2gwMmp2dTFrcGhmY3Z5NWgzIn0.8J8YJkhUxbP6jmB6VK4RLw',
  {attribution: "Basemap &copy; <a href='https://www.mapbox.com/map-feedback/'>Mapbox</a> &copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>"}
  ).addTo(map);

var geojsonLayer;
var pointFeatures = {
  max: 8,
  data: []
};

var cfg = {
  // radius should be small ONLY if scaleRadius is true (or small radius is intended)
  // if scaleRadius is false it will be the constant radius used in pixels
  "radius": 20,
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

var heatmapLayer = new HeatmapOverlay(cfg);

function rescaleOpacity(val) {
  return Math.sin(val) + .15
}

function circleMakerStyle(feature) {
  return {
    radius: 3,
    // fillColor: "#f16651",
    // color: "#fbae37",
    fillColor: "#144991",
    color: "#144991",
    weight: 1,
    opacity: .6,
    fillOpacity: rescaleOpacity(feature.properties.IDPfamilies / maxIntensity)
  };
}

function handleJson(data) {
	console.log(data)
  // populate density layer	
  for (i in data.features) {
    point = {
      lat: data.features[i].properties.Latitude,
      lng: data.features[i].properties.Longitude,
      count: data.features[i].properties.IDPfamilies
    };
    pointFeatures.data.push(point);
  };
  heatmapLayer.setData(pointFeatures);
  
  intensities = []
  for (i in data.features) {
	intensities.push(data.features[i].properties.IDPfamilies)
  }
  maxIntensity = Math.max.apply(Math, intensities);
  
  // populate point layer
  geojsonLayer = L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng, circleMakerStyle(feature));
    },
	
    onEachFeature: function(feature, layer) {
	
	
		// put together a list of all the origins 
		origins = "";
		
		for (gov in governorates) {
		  if (feature.properties[governorates[gov]] != "") {
			gov_of_orig = governorates[gov]
			gov_of_orig_pop = feature.properties[governorates[gov]]
			origins += gov_of_orig + ": " + gov_of_orig_pop + "<br />"
		  };
		};

		layer.bindPopup(
			"<center><small>Governorate - District</small><br />" +
			feature.properties.Governorate + " - " + feature.properties.District + "<br /><hr>" +
			"<b>" + feature.properties.LocationName + " - " + feature.properties.ArabicName + "<br />" + 
			// "<b><a href='" + feature.properties.SAT.slice(12, -13) + "' target = '_blank'>" + feature.properties.LocationName + " - " + feature.properties.ArabicName + "</a></b><br />" +
			feature.properties.IDPfamilies + " Families</b><br /><br />" + origins + "</center><br/>"
		);
    }
  }).addTo(map);
  
  L.control.layers({
    "Satellite": satLayer,
    "Grey": baseLayer
  }, {
    "Density": heatmapLayer,
    "Points": geojsonLayer
  }, {
    collapsed: false
  }).addTo(map);
  
  map.attributionControl.addAttribution('Thematic data <a href="http://iraqdtm.iom.int">DTM Iraq</a>');
  
};

//grab points from geoserver - need to enable JSONP in geoserver first 
$.ajax({
  url: "http://iraqdtm.iom.int:8081/geoserver/cite/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=cite:vw_DTM_Dataset_Publish_latestRound&outputFormat=text%2Fjavascript&format_options=callback:getJson",
  dataType: 'jsonp',
  jsonpCallback: 'getJson',
  success: handleJson
});

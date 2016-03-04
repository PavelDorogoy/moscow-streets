require('leaflet-ajax');

/** search-box
*/

/**
* Set CartoDB Dark Matter Basemap to both map-divs
*/

var layer1 = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',{
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
});

var mapMoscow = L.map(document.getElementsByClassName('map-moscow')[0]).setView([59, 90], 3);
mapMoscow.addLayer(layer1);

/**
* setting list function
*/

var lis = document.querySelectorAll('li');
var selected_data, Geodesic;
var latLngArray = [];

function show() {
  for (var i = 0; i < lis.length; i++) {
      lis[i].style.color = '#666666';
    }

  this.style.color = 'yellow';

  if (selected_data) {
    mapMoscow.removeLayer(selected_data);
  }
  if (Geodesic) {
    mapMoscow.removeLayer(Geodesic);
  }
  latLngArray.length = 0;

  Geodesic = L.geodesic([], {
      weight: 1.5,
      opacity: 0.7,
      color: 'yellow',
      steps: 50
  }).addTo(mapMoscow);

  var selectedMarkerOptions = {
      radius: 5,
      fillColor: "#FFFF00",
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
  };
  var txt = this.innerHTML.trim();

selected_data = new L.geoJson.ajax("https://raw.githubusercontent.com/ggolikov/moscow-streets/master/mosstreets_full.geo.json", {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, selectedMarkerOptions);
        },
        filter: function(feature){
          return feature.properties.street == txt;
        },
        onEachFeature: function(feature, layer){
            if(+feature.properties['№'] < 499) {
              layer.bindPopup(feature.properties.street);
            } else {
              layer.bindPopup(feature.properties.object + "<br>" + feature.properties.object_class);
            }
        },
    });

  mapMoscow.addLayer(selected_data);

  selected_data.once('data:loaded', function() {
      this.eachLayer(function(feature, layer) {
        latLngArray.push(feature.getLatLng());
      });
      Geodesic.setLatLngs([[latLngArray[0], latLngArray[1]]]);
      mapMoscow.fitBounds([[latLngArray[0]], [latLngArray[1]]]);
    }, selected_data);
}

for (var i = 0; i < lis.length; i++) {
    lis[i].addEventListener('click', show);
  }


/**
* adding Moscow and world data in geojson
*/

var moscowMarkerOptions = {
    radius: 5,
    fillColor: "#CC6600",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};
var worldMarkerOptions = {
    radius: 5,
    fillColor: null,
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

var moscow_data = new L.geoJson.ajax("https://raw.githubusercontent.com/ggolikov/moscow-streets/master/map_moscow.geo.json", {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, moscowMarkerOptions);
    },
    onEachFeature: function(feature, layer){
        layer.bindPopup(feature.properties.street + "<br>" + feature.properties.street_wiki);
    }
});

var world_data = new L.geoJson.ajax("https://raw.githubusercontent.com/ggolikov/moscow-streets/master/map_world.geo.json", {
    style: function (feature) {
      switch (feature.properties.object_class) {
          case 'населенный пункт': return {fillColor: "#003399"};
          case 'природный объект':   return {fillColor: "#009966"};
          case 'район': return {fillColor: "#669933"};
          case 'станция':   return {fillColor: "#996666"};
          case 'страна': return {fillColor: "#990033"};
          case 'субьект Федерации':   return {fillColor: "#993300"};
          case 'усадьба': return {fillColor: "№990099"};
          case 'часть света':   return {fillColor: "33CCCC"};
      }
    },
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, worldMarkerOptions);
    },
    onEachFeature: function(feature, layer){
        layer.bindPopup(feature.properties.object + "<br>" + feature.properties.object_class +  "<br>" + feature.properties.object_wiki);
    },

});


mapMoscow.addLayer(moscow_data);
mapMoscow.addLayer(world_data);

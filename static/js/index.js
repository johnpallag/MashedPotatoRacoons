/*global
io, google, document, navigator, $
*/
"use strict";
const id = Math.random();
const socket = io();
const REFRESH_RATE = 1500;

var map;
var heatmap;
var center = null;
var markers = [];

function getPosition(callback) {
  setTimeout(function(){
    getPosition(callback);
  }, REFRESH_RATE);
  if (navigator && navigator.geolocation && navigator.geolocation.getCurrentPosition) {
    navigator.geolocation.getCurrentPosition(function(loc) {
      callback({
        lat: loc.coords.latitude,
        lng: loc.coords.longitude
      });
    });
  } else {
    callback({
      lat: 0,
      lng: 0
    });
  }
}

function initMap() {
  var uluru = {
    lat: 32,
    lng: -117
  };
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 14,
    center: uluru
  });
  if (center) {
    map.setCenter(center);
  }

  getPosition(function(loc){
    center = loc;
    if (map) {
      map.setCenter(loc);
      socket.emit("joined", JSON.stringify(loc));
    }
  });
}

$(".button-collapse").sideNav();
socket.on("update", function(evt) {
  var locations = JSON.parse(evt);
  if (map) {
    markers.forEach(function(marker) {
      marker.setMap(null);
    });

    heatmap = new google.maps.visualization.HeatmapLayer({
      data: markers.map(function(marker){return marker.position;}),
      map: map
    });
    markers = [];

    locations.forEach(function(coords) {
      markers.push(new google.maps.Marker({
        position: coords,
        map: null
      }));
    });
  }
});

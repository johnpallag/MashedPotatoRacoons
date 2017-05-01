/*global
io, google, document, navigator, $, window
*/
"use strict";
const id = "ep" + Math.floor(Math.random() * 100000);
const color = '#' + Math.floor(Math.random() * 16777215).toString(16);
const socket = io();
const REFRESH_RATE = 1500;

var map;

var center = null;
var markers = [];
var players = {};
var heatmaps = {};
var heatmapDatas = {};

function getPosition(callback) {
  setTimeout(function() {
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

  getPosition(function(loc) {
    center = loc;
    if (map) {
      map.setCenter(loc);
      socket.emit("locationChanged", JSON.stringify({
        id: id,
        location: loc
      }));
    }
  });
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

$(document).ready(function() {
  $(".button-collapse").sideNav();
  socket.on("joined", function(evt) {
    players = JSON.parse(evt);
    Object.keys(players).forEach(function(player) {
      if (!heatmaps[player]) {
        heatmapDatas[player] = new google.maps.MVCArray([]);
        heatmaps[player] = new google.maps.visualization.HeatmapLayer({
          data: heatmapDatas[player],
          map: map
        });

        var rgb = hexToRgb(players[player].color);
        var gradient = ['rgba(0, 255, 255, 0)'];
        if(rgb){
          gradient.push('rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', 1)');
        } else {
          gradient.push('rgba(0,0,0, 1)');
        }
        heatmaps[player].set('gradient', gradient);
      }
    });
  });
  socket.emit("joined", JSON.stringify({
    id: id,
    color: color
  }));
  socket.on("update", function(evt) {
    var player = JSON.parse(evt);
    heatmapDatas[player.id].push(new google.maps.LatLng(player.location));
  });
});

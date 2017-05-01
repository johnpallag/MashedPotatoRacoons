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
    zoom: 22,
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

function hexToRGB(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

    if (alpha) {
        return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
    } else {
        return "rgb(" + r + ", " + g + ", " + b + ")";
    }
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

        var gradient = ['rgba(255, 255, 255, 0)', hexToRGB(players[player].color, 1) ];
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

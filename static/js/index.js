/*global
io, google, document, navigator, $, window, location, mapStyle
*/
"use strict";
const id = "ep" + Math.floor(Math.random() * 100000);
const color = '#' + Math.floor(Math.random() * 16777215).toString(16);
const socket = io();
const REFRESH_RATE = 1500;

var map;
var center = null;
var googleIsLoaded = false;

var players = {};
var markers = {};
var circles = {};
var heatmap = null;
var heatmapData = {};

function signup(email, password, virus){
  socket.emit("signup", JSON.stringify({
    email: email,
    password: password,
    virus: virus
  }));
}

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

function infect() {
  socket.on("success",function(json){
    console.log(json);
  });
  socket.emit("infect", JSON.stringify({
    id: id
  }));
}

function initMap() {
  var uluru = {
    lat: 32,
    lng: -117
  };
  googleIsLoaded = true;

  heatmapData = new google.maps.MVCArray([]);
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 22,
    center: uluru,
    styles: mapStyle
  });
  heatmap = new google.maps.visualization.HeatmapLayer({
    data: heatmapData,
    map: map,
    radius: 50
  });
  var gradient = ['rgba(255, 255, 255, 0)',
    hexToRGB(color, 1), hexToRGB(color, 1), hexToRGB(color, 1), hexToRGB(color, 1), hexToRGB(color, 1),
    hexToRGB(color, 1), hexToRGB(color, 1)
  ];
  heatmap.set('gradient', gradient);
  if (center) {
    map.setCenter(center);
  }

  getPosition(function(loc) {
    center = loc;
    if (map) {
      map.setCenter(loc);
      heatmapData.push({
        location: new google.maps.LatLng(loc.lat, loc.lng),
        weight: 5
      });
      socket.emit("updateLocation", JSON.stringify({
        id: id,
        location: loc
      }));
    }
  });
}

function resetMarkers() {
  Object.keys(markers).forEach(function(id) {
    markers[id].setMap(null);
  });
}

function resetCircles() {
  Object.keys(markers).forEach(function(id) {
    circles[id].setMap(null);
  });
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

$(document).ready(function() {
  $("#Infect-button").on('click', infect);
  $(".button-collapse").sideNav();
  socket.on("data", function(evt) {
    players = JSON.parse(evt);
    resetMarkers();
    resetCircles();
    Object.keys(players).forEach(function(id) {
      if(googleIsLoaded){
        markers[id] = markers[id] || new google.maps.Marker({
          icon: {
            url: location.href + 'images/' + players[id].virus.params.image + '.png',
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(50, 50)
          }
        });
        markers[id].setPosition(players[id].location);
        markers[id].setMap(map);
        circles[id] = circles[id] || new google.maps.Circle({
            strokeColor: players[id].virus.params.color,
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: players[id].virus.params.color,
            fillOpacity: 0.35,
            radius: players[id].virus.threshold
          });
          circles[id].setMap(map);
          circles[id].setCenter(new google.maps.LatLng(players[id].location));
      }
    });
    $("#viruses").html("");
    $("#points").html("0 points");
    if(players && players[id]){
      players[id].viruses.forEach(function(virus){
        var vDiv = $("<div>");
        vDiv.css("background-color", virus.params.color);
        vDiv.css("background-image", "url(" + location.href + 'images/' + virus.params.image + '.png)');
        vDiv.addClass("virusIcon");
        $("#viruses").append(vDiv);
      });
      players[id].score = players[id].score || 0;
      $("#points").html(players[id].score + " points");
    }
  });
  socket.emit("joined", JSON.stringify({
    id: id,
    virus: {
      threshold: 5,
      image: getRandomInt(0, 6),
      color: color
    }
  }));
});

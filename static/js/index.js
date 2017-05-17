/*global
io, google, document, navigator, $, window, location, mapStyle, localStorage, alert
*/
"use strict";
const socket = io();
const REFRESH_RATE = 1500;

var map;
var center = null;
var googleIsLoaded = false;

var player = null;
var players = {};
var markers = {};
var circles = {};
var heatmap = null;
var heatmapData = {};

function leaderboard(){
  var arr = Object.keys(players).sort(function(a,b){
    return (players[a].points || 0) > (players[b].points || 0);
  });
  return arr.map(function(id){
    return players[id];
  }).slice(0, 9);
}

function signup(email, password, virus){
  localStorage.email = email;
  localStorage.password = password;
  socket.emit("signup", JSON.stringify({
    email: email,
    password: password,
    virus: virus
  }));
}

function signin(email, password){
  localStorage.email = email;
  localStorage.password = password;
  socket.emit("signin", JSON.stringify({
    email: email,
    password: password
  }));
}

function logout(){
  localStorage.removeItem("email");
  localStorage.removeItem("password");
}

function authenticate(){
  if(localStorage.email && localStorage.password){
    signin(localStorage.email, localStorage.password);
  }
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
  socket.emit("infect", JSON.stringify({
    id: player.id
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
  authenticate();
}

function onLoggedIn(){
  $("#loginmodel").hide();
  $("#Infect-button").show();
  var gradient = ['rgba(255, 255, 255, 0)',
    hexToRGB(player.virus.params.color, 1), hexToRGB(player.virus.params.color, 1), hexToRGB(player.virus.params.color, 1), hexToRGB(player.virus.params.color, 1), hexToRGB(player.virus.params.color, 1),
    hexToRGB(player.virus.params.color, 1), hexToRGB(player.virus.params.color, 1)
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
        id: player.id,
        location: loc
      }));
    }
  });
  $("#viruses").html("");
  $("#points").html("0 points");
  if(players && players[player.id]){
    players[player.id].viruses.forEach(function(virus){
      var vDiv = $("<div>");
      vDiv.css("background-color", virus.params.color);
      vDiv.css("background-image", "url(" + location.href + '/images/' + (virus.params.image||0) + '.png)');
      vDiv.addClass("virusIcon");
      $("#viruses").append(vDiv);
    });
    players[player.id].score = players[player.id].score || 0;
    $("#points").html(players[player.id].score + " points");
  }
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
  $("#signin").on('click',function(e){
    signin($("#email").val(), $("#password").val());
    e.preventDefault();
  });
  $("#signup").on('click',function(e){
    signup($("#email").val(), $("#password").val(), {
      color: '#'+Math.floor(Math.random()*16777215).toString(16),
      image: getRandomInt(0, 6),
      theshold: 1
    });
    e.preventDefault();
  });
  socket.on("success",function(evt){
    player = JSON.parse(evt);
    onLoggedIn();
  });
  socket.on("displayError", function(evt){
    alert(evt);
    logout();
  });
  socket.on("data", function(evt) {
    players = JSON.parse(evt);
    resetMarkers();
    resetCircles();
    Object.keys(players).forEach(function(id) {
      if(googleIsLoaded){
        markers[id] = markers[id] || new google.maps.Marker({
          icon: {
            url: location.href + 'images/' + (players[id].virus.params.image||0) + '.png',
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
  });
});

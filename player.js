"use strict";

const Player = function(id, email, password, virus){
  this.id = id;
  this.virus = virus;
  this.viruses = [];
  this.location = {};
  this.history = [];
  this.email = email;
  this.password = password;
};

Player.prototype.updateLocation = function(loc){
  this.history.push(this.location);
  this.location = loc;
};

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d;
}

Player.prototype.distance = function(player){
  return getDistanceFromLatLonInKm(this.location.lat, this.location.lng, player.location.lat, player.location.lng) * 1000;
};

Player.prototype.infect = function(virus){
  var done = false;
  this.viruses.forEach(function(v){
    if(v.id === virus.id) {
      done = true;
    }
  });
  if(!done){
    this.viruses.push(virus);
    return true;
  }
  return false;
};

exports.Player = Player;

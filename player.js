"use strict";

const Player = function(id, name, username, virus){
  this.id = id;
  this.virus = virus;
  this.name = name;
  this.username = username;
  this.viruses = [];
  this.location = {};
  this.history = [];
  this.historyCount = 0;
  this.stats = {
    infectedCount: 0,
    powerupCount: 0,
    distanceTraveled: 0
  };
};

Player.prototype.updateLocation = function(loc){
  this.history[this.historyCount] = this.location;
  this.historyCount = (this.historyCount + 1) % 100;
  if(this.location.lat && this.location.lng) {
    this.stats.distanceTraveled += this.distance({location:loc});
  }
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

Player.prototype.removeVirus = function(virus){
  var self = this;
  for(var i=0;i<self.viruses.length;i++){
    if(self.viruses[i].id === virus.id) {
      self.viruses.splice(i, 1);
      return;
    }
  }
}

Player.prototype.infect = function(virus){
  var done = false;
  var self = this;
  this.viruses.forEach(function(v){
    if(v.id === virus.id) {
      done = true;
    }
  });
  if(!done){
    this.viruses.push(virus);
    setTimeout(function(){
      self.removeVirus(virus);
    }, virus.params.lifetime * 1000 * 60);
    return true;
  }
  return false;
};

exports.Player = Player;

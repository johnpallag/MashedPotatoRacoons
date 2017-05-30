"use strict";

const Virus = function(id, params){
  this.id = id;
  this.threshold = params.threshold || 2;
  this.params = params;
};

Virus.prototype.powerup = function(){
  this.threshold = this.threshold + 2.0;
  var self = this;
  setTimeout(function(){
    self.threshold = self.threshold - 2.0;
  }, 5000);
};

exports.Virus = Virus;

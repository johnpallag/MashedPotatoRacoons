"use strict";

const Virus = function(id, params){
  this.id = id;
  this.threshold = params.threshold || 0.001;
  this.params = params;
};

exports.Virus = Virus;

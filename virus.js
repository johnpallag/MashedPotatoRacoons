"use strict";

const Virus = function(id, params){
  this.id = id;
  this.threshold = params.threshold || 1;
  this.params = params;
};

exports.Virus = Virus;

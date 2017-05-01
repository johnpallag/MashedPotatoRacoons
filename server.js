// Express is a web framework for node.js
// that makes nontrivial applications easier to build
"use strict";
var express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use(express.static(__dirname + '/static'))
  .listen(PORT, () => console.log('Listening on %s', PORT));

const io = socketIO(server);

// TODO: Create some data structure to hold current users
// TODO: Login
// TODO: Other server calls???

var players = {};

io.on('connection', function(socket){
  // TODO: Handle events
  socket.on('joined', function(json){
    var data = JSON.parse(json);
    players[data.id] = data || players[data.id];
    data.locations = data.locations || [];
    io.emit('joined', JSON.stringify(players));
  });
  socket.on('locationChanged', function(json){
    var data = JSON.parse(json);
    players[data.id].locations.push(JSON.parse(json).location);
    io.emit('update', json);
  });
});

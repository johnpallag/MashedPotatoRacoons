// Express is a web framework for node.js
// that makes nontrivial applications easier to build
"use strict";
var express = require('express');
const socketIO = require('socket.io');
const Player = require('./player').Player;
const Virus = require('./virus').Virus;

const PORT = process.env.PORT || 3000;

const server = express()
  .use(express.static(__dirname + '/static'))
  .listen(PORT, () => console.log('Listening on %s', PORT));

const io = socketIO(server);

var players = {};

io.on('connection', function(socket){
  socket.on('joined', function(json){
    const data = JSON.parse(json);
    const id = data.id;
    const virusParams = data.virus;
    if(!id || players[id] || !virusParams) {
      return;
    }
    const virus = new Virus(id, virusParams);
    const player = new Player(id, virus);
    players[id] = player;
    io.emit('data', JSON.stringify(players));
  });
  socket.on('updateLocation', function(json){
    const data = JSON.parse(json);
    const id = data.id;
    const loc = data.location;
    if(!id || !players[id] || !loc) {
      return;
    }
    players[id].updateLocation(loc);
    io.emit('data', JSON.stringify(players));
  });
  socket.on('infect', function(json){
    const data = JSON.parse(json);
    const id = data.id;
    if(!id || !players[id]) {
      return;
    }
    const currentPlayer = players[id];
    function tryInfect(virus, player){
      const distance = currentPlayer.distance(player);
      if(distance <= virus.threshold && virus.id !== player.id){
        if(player.infect(virus)){
          players[virus.id].score = players[virus.id].score || 0;
          players[virus.id].score += 100;
        }
      }
    }
    Object.keys(players).forEach(function(id){
      if(id !== currentPlayer.id){
        tryInfect(currentPlayer.virus, players[id]);
        currentPlayer.viruses.forEach(function(virus){
          tryInfect(virus, players[id]);
        });
      }
    });
    io.emit('data', JSON.stringify(players));
  });
  io.emit('data', JSON.stringify(players));
});

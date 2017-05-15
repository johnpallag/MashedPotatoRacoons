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
var logins = {};

io.on('connection', function(socket){
  socket.on('signup', function(json){
    const data = JSON.parse(json);
    if(!data.email) {
      socket.emit('displayError', "Missing email");
    } else if(!data.password){
      socket.emit('displayError', "Missing password");
    } else if(!data.virus){
      socket.emit('displayError', "Missing virus details");
    } else {
      const login = Object.keys(logins).filter(function(id){
        return logins[id].email.toLowerCase() === data.email.toLowerCase();
      })[0];
      if(login){
        socket.emit('displayError', "Account already exists");
      } else {
        const id = "ep" + Math.floor(Math.random() * 100000);
        var newVirus = new Virus(id, data.virus);
        var newPlayer = new Player(id, newVirus);
        logins[id] = {
          id: id,
          email: data.email,
          password: data.password
        };
        players[id] = newPlayer;
        socket.emit('success', JSON.stringify(newPlayer));
      }
    }
  });
  socket.on('signin', function(json){
    const data = JSON.parse(json);
    const login = Object.keys(logins).filter(function(id){
      return logins[id].email.toLowerCase() === data.email.toLowerCase();
    })[0];
    if(!login){
      socket.emit('displayError', "Account not found");
    } else {
      if(logins[login].password === data.password){
        socket.emit('success', JSON.stringify(players[login]));
      } else {
        socket.emit('displayError', "Incorrect password");
      }
    }
  });
  socket.on('authenticate', function(json){
    const data = JSON.parse(json);
    const id = data.id;
    if(!players[id]){
      socket.emit('displayError', "Invalid id");
    } else {
      socket.emit('success', JSON.stringify(players[id]));
    }
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

// Express is a web framework for node.js
// that makes nontrivial applications easier to build
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

io.on('connection', function(socket){
  // TODO: Handle events
  socket.on('message', function(json){
    io.emit('response', json);
  });
});

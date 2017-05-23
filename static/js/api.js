"use strict";
var EG;
const socket = io();
const REFRESH_RATE = 1500;

EG = EG || {};

function post(action, body, onSuccess, onError) {
    EG.API._Callbacks._onerror = onError;
    EG.API._Callbacks._onsuccess = onSuccess;
    socket.emit(action, JSON.stringify(body));
}

EG.API = {
    _Callbacks:{
      _onerror: null,
      _onsuccess: null,
      _ondata: null
    },
    Account: {
        signin: function(username, password, onSuccess, onError) {
            post("signin", {
                username: username,
                password: password
            }, function(player) {
                EG.API.Account.currentPlayer = player;
                localStorage.username = username;
                localStorage.password = password;
                if (onSuccess) onSuccess(player);
            }, function(evt) {
                EG.API.Account.logout();
                if (onError) onError(evt);
            });
        },
        signup: function(username, password, virus, onSuccess, onError) {
            post("signup", {
                username: username,
                password: password,
                virus: virus
            }, function(player) {
                EG.API.Account.currentPlayer = player;
                localStorage.username = username;
                localStorage.password = password;
                if (onSuccess) onSuccess(player);
            }, function(evt) {
                EG.API.Account.logout();
                if (onError) onError(evt);
            });
        },
        logout: function(callback) {
            localStorage.removeItem("username");
            localStorage.removeItem("password");
            EG.API.currentPlayer = null;
            if(callback) callback();
        },
        authenticate: function(onSuccess, onError) {
            if (localStorage.username && localStorage.password) {
                EG.API.Account.signin(localStorage.username, localStorage.password, onSuccess, onError);
            }
        },
        currentPlayer: null
    },
    Util: {
        hexToRGB: function(hex, alpha) {
          if(!hex) return "rgba(0,0,0,1)";
            var r = parseInt(hex.slice(1, 3), 16),
                g = parseInt(hex.slice(3, 5), 16),
                b = parseInt(hex.slice(5, 7), 16);

            if (alpha) {
                return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
            } else {
                return "rgb(" + r + ", " + g + ", " + b + ")";
            }
        },
        getRandomInt: function(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min)) + min;
        },
        randColor: function(){
          return '#'+Math.floor(Math.random()*16777215).toString(16);
        }
    },
    Game: {
        addDataCallback: function(callback){
          dataCallbacks.push(callback);
        },
        infect: function() {
            post("infect", {
                id: EG.API.Account.currentPlayer.id
            });
        },
        updateLocation: function(){
          socket.emit("updateLocation", JSON.stringify({
            id: EG.API.Account.currentPlayer.id,
            location: EG.API.Game.currentLocation
          }));
        },
        getLeaderboard: function(callback) {
            callback(Object.keys(EG.API.Game.players).sort(function(a, b) {
                return (EG.API.Game.players[a].points || 0) < (EG.API.Game.players[b].points || 0);
            }).map(function(id) {
                return EG.API.Game.players[id];
            }).slice(0, 9));
        },
        getPosition: function(onSuccess, onError) {
            if (navigator && navigator.geolocation && navigator.geolocation.getCurrentPosition) {
                navigator.geolocation.getCurrentPosition(function(loc) {
                    EG.API.Game.currentLocation = {
                        lat: loc.coords.latitude,
                        lng: loc.coords.longitude
                    };
                    onSuccess(EG.API.Game.currentLocation);
                }, function(error) {
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            onError("User denied the request for Geolocation.");
                            break;
                        case error.POSITION_UNAVAILABLE:
                            onError("Location information is unavailable.");
                            break;
                        case error.TIMEOUT:
                            onError("The request to get user location timed out.");
                            break;
                        case error.UNKNOWN_ERROR:
                            onError("An unknown error occurred.");
                            break;
                    }
                });
            } else {
                onError("Geolocation is not supported by this device")
            }
        },
        players: {},
        currentLocation: {}
    }
};

socket.on("data", function(evt) {
  EG.API.Game.players = JSON.parse(evt);
  if(EG.API.Account.currentPlayer){
    EG.API.Account.currentPlayer = EG.API.Game.players[EG.API.Account.currentPlayer.id];
  }
  if(EG.API._Callbacks._ondata) EG.API._Callbacks._ondata(EG.API.Game.players);
});

socket.on("success", function(evt){
  if(EG.API._Callbacks._onsuccess) EG.API._Callbacks._onsuccess(JSON.parse(evt));
});

socket.on("requestError", function(evt){
  if(EG.API._Callbacks._onerror) EG.API._Callbacks._onerror(evt);
});

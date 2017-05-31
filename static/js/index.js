/*global
io, google, document, navigator, $, window, location, mapStyle, localStorage, alert, socket, REFRESH_RATE, EG
*/
"use strict";
if (location.href.indexOf("index.html") > -1) {
    location.href = "/";
} else if (location.protocol !== 'https:' && location.href.indexOf("localhost") < 0) {
    location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
}

var infowindow = null;
var map;
var center = null;
var googleIsLoaded = false;

var markers = {};
var powerupMarkers = [];
var circles = {};
var heatmap = null;
var heatmapData = {};
var currentLevel = 0;

function updateScreen() {
    $("#viruses").html("");
    $("#points").html("0 points");
    if (EG.API.Game.players && EG.API.Account.currentPlayer) {
        EG.API.Account.currentPlayer.viruses.forEach(function(virus) {
            var vDiv = $("<div>");
            vDiv.css("background-color", virus.params.color);
            vDiv.css("background-image", "url(" + location.href + '/images/virus_' + (virus.params.image || 1) + '.png)');
            vDiv.addClass("virusIcon");
            $("#viruses").append(vDiv);
        });
        if (EG.API.Account.currentPlayer.viruses.length > 0) {
            $("#helpSmall").show();
        } else {
            $("#helpSmall").hide();
        }
        EG.API.Account.currentPlayer.score = EG.API.Account.currentPlayer.score || 0;
        $("#points").html(EG.API.Account.currentPlayer.score + " points");
    }
}

function getPosition(callback) {
    setTimeout(function() {
        getPosition(callback);
    }, REFRESH_RATE);
    EG.API.Game.getPosition(callback, console.log);
}

function initMap() {
    var uluru = {
        lat: 32.8783097,
        lng: -117.2409619
    };
    googleIsLoaded = true;

    infowindow = new google.maps.InfoWindow({
        content: ""
    });
    heatmapData = new google.maps.MVCArray([]);
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: uluru,
        styles: mapStyle
    });
    heatmap = new google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        map: map,
        radius: 50
    });
    EG.API.Account.authenticate(onLoggedIn);
}

function onLoggedIn() {
    $("#loginmodel").hide();
    $("#points").show();
    $("#profileLink").show();
    $("#Infect-button").show();
    currentLevel = EG.API.Account.calcLevel();
    var player = EG.API.Account.currentPlayer;
    player.virus = player.virus || {};
    player.virus.params = player.virus.params || {};
    player.virus.color = player.virus.color || EG.API.Util.randColor();
    document.getElementById('profilePic_Nav').src = "../choose_virus/img/virus_" + player.virus.params.image + ".png";
    $("#accountName").text(player.name || "Your Name");
    var gradient = ['rgba(255, 255, 255, 0)',
        EG.API.Util.hexToRGB(player.virus.params.color, 1), EG.API.Util.hexToRGB(player.virus.params.color, 1),
        EG.API.Util.hexToRGB(player.virus.params.color, 1), EG.API.Util.hexToRGB(player.virus.params.color, 1),
        EG.API.Util.hexToRGB(player.virus.params.color, 1), EG.API.Util.hexToRGB(player.virus.params.color, 1),
        EG.API.Util.hexToRGB(player.virus.params.color, 1)
    ]; 
    heatmap.set('gradient', gradient);
    map.setZoom(22);
    if (center) {
        map.setCenter(center);
    }

    getPosition(function(loc) {
        center = loc;
        if (map) {
            map.setCenter(loc);
            heatmapData.push({
                location: new google.maps.LatLng(loc.lat, loc.lng),
                weight: 5
            });
            EG.API.Game.updateLocation();
        }
    });
    updateScreen();
}

$(document).ready(function() {
    $("#Infect-button").on('click', EG.API.Game.infect);
    $(".button-collapse").sideNav();
    $("#signin").on('click', function(e) {
        EG.API.Account.signin($("#username").val(), $("#password").val(), onLoggedIn, alert);
        e.preventDefault();
    });
    $("#signup").on('click', function(e) {
        location.href = "choose_virus/index.html?signup=true";
        e.preventDefault();
    });
    EG.API._Callbacks._onpowerups = function(powerups) {
        var i = 0;
        powerups.forEach(function(powerup) {
            powerupMarkers[i] = powerupMarkers[i] ||
                new google.maps.Marker({
                    icon: {
                        url: location.href + 'images/powerup.png',
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(50, 50)
                    },
                    map: map
                });
            powerupMarkers[i].setPosition(powerup);
            i++;
        });
    };
    EG.API._Callbacks._ondata = function(players) {
        updateScreen();
        Object.keys(players).forEach(function(id) {
            if (googleIsLoaded) {
                if (!markers[id]) {
                    markers[id] = new google.maps.Marker({
                        icon: {
                            url: location.href + 'images/virus_' + (players[id].virus.params.image || 1) + '.png',
                            origin: new google.maps.Point(0, 0),
                            anchor: new google.maps.Point(50, 50),
                            labelContent: players[id].username,
                            labelAnchor: new google.maps.Point(3, 30),
                            labelClass: "labels", // the CSS class for the label
                            labelInBackground: false
                        },
                        map: map
                    });
                    markers[id].addListener('click', function() {
                        if (id == EG.API.Account.currentPlayer.id) {
                            infowindow.setContent("<div style='text-align: center;font-size: 25px;'>You</div>" +
                                "<div>Carrying " + (EG.API.Game.players[id].viruses.length + 1) + " " +
                                ((EG.API.Game.players[id].viruses.length > 0) ? "virues" : "virus") + "</div>");
                        } else {
                            infowindow.setContent("<div style='text-align: center;font-size: 25px;'>" + EG.API.Game.players[id].username + "</div>" +
                                "<div>Carrying " + (EG.API.Game.players[id].viruses.length + 1) + " " +
                                ((EG.API.Game.players[id].viruses.length > 0) ? "viruses" : "virus") + "</div>");
                        }
                        infowindow.open(map, markers[id]);
                    });
                }
                markers[id].setPosition(players[id].location);
                circles[id] = circles[id] || new google.maps.Circle({
                    strokeColor: players[id].virus.params.color,
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: players[id].virus.params.color,
                    fillOpacity: 0.35,
                    map: map
                });
                circles[id].setRadius(players[id].virus.threshold);
                circles[id].setCenter(new google.maps.LatLng(players[id].location));
            }
        });
        var level = EG.API.Account.calcLevel();
        $("#accountLevel").text("level " + level);
        $("#accountPointsBar").css("width", EG.API.Account.levelCompletion() + "%");
        if (level > currentLevel) {
            currentLevel = level;
            var levelUpDiv = $("<div class='points-scored'>Level Up!</div>");
            $("body").append(levelUpDiv);
            setTimeout(function() {
                levelUpDiv.remove();
            }, 2000);
        }
    };
    EG.API._Callbacks._oninfectresult = function(obj) {
        if (obj.score <= 0) {
            return;
        }
        var scoreDivHTML = "<div class='points-scored'>";
        if (obj.infectedCount > 1) {
            scoreDivHTML += "Combo " + obj.infectedCount;
        }
        scoreDivHTML += "+ " + obj.score + "</div>";
        var scoreDiv = $(scoreDivHTML);
        $("body").append(scoreDiv);
        setTimeout(function() {
            scoreDiv.remove();
        }, 2000);
    };
    EG.API._Callbacks._onpowerup = function() {
        var powerupDivHTML = "<div class='points-scored'>POWER UP!</div>";
        var powerupDiv = $(powerupDivHTML);
        $("body").append(powerupDiv);
        setTimeout(function() {
            powerupDiv.remove();
        }, 2000);
    }
});

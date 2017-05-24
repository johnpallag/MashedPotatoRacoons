"use strict";

var img = 12;
var d = 2;
var t = 1;

function changeImage(imagelink, distance, infection) {
    img = imagelink;
    d = parseInt(distance) / 5;
    t = parseFloat(infection);
    document.getElementById('yourvirus').src = "./img/virus_" + imagelink + ".png";
    document.getElementById('yourdistance').innerHTML = "Distanced: " + distance + " ft";
    document.getElementById('yourinfection').innerHTML = "Time: " + infection + " day";

    document.getElementById('chosenvirus').src = "./img/virus_" + imagelink + ".png";
    document.getElementById('chosendistance').innerHTML = "Distanced: " + distance + " ft";
    document.getElementById('choseninfection').innerHTML = "Time: " + infection + " day";
}

$(document).ready(function() {
  $(".button-collapse").sideNav();
    setTimeout(function() {
        $("#name").val("");
        $("#username").val("");
        $("#password").val("");
    }, 100);
    $('.carousel').carousel({
        dist: 0,
        shift: 0,
        padding: 0,
    });

    $('.modal').modal();

    var player;
    if (location.href.indexOf("signup") > -1) {
        $("#loginmodel").show();
        $("#virusCreator").hide();
    }

    $("#signup").on("click", function(e) {
        if ($("#name").val() === "") alert("Missing name");
        else if ($("#username").val() === "") alert("Missing username");
        else if ($("#password").val() === "") alert("Missing password");
        else {
            $("#loginmodel").hide();
            $("#virusCreator").show();
        }
        e.preventDefault();
    });

    $("#continueToGame").on('click', function() {
        var virus = {
          color: '#' + Math.floor(Math.random() * 16777215).toString(16),
          image: img,
          theshold: d,
          lifetime: t
        };
        EG.API.Account.signup($("#username").val(), $("#password").val(), $("#name").val(), virus, function() {
            location.href = "..";
        }, alert);
    });
});

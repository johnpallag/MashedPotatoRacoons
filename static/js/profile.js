"use strict";

$(document).ready(function() {
    $(".button-collapse").sideNav();
    EG.API.Account.authenticate(onAuthentication);
 
    function onAuthentication() {
        var player = EG.API.Account.currentPlayer;
        player.virus = player.virus || {};
        player.virus.params = player.virus.params || {};
        player.virus.color = player.virus.color || EG.API.Util.randColor();
        
        
        document.getElementById('profilePic').src = "../choose_virus/img/virus_" + player.virus.params.image + ".png";
        document.getElementById('profilePic_Nav').src = "../choose_virus/img/virus_" + player.virus.params.image + ".png";
        $("#accountName").text(player.name || "Your Name");
        $("#profileName").text(player.name || "Your Name");
        $("#profileUsername").text(player.username || "Your Username");
        var level = EG.API.Account.calcLevel();
        $("#accountLevel").text("level " + level);
        $("#accountPointsBar").css("width", EG.API.Account.levelCompletion() + "%");
        $("#profileLevelBar").css("width", EG.API.Account.levelCompletion() + "%");
        $("#profileLevel").text("Level " + level);
        $("#stats-virusCount").text(EG.API.Account.currentPlayer.viruses.length);
        $("#stats-infectCount").text(EG.API.Account.currentPlayer.stats.infectedCount);
        $("#stats-powerupCount").text(EG.API.Account.currentPlayer.stats.powerupCount);
        $("#stats-distance").text(EG.API.Account.currentPlayer.stats.distanceTraveled);
    }
    $("#logout_profile").on("click",function(){
      EG.API.Account.logout(function(){
        location.href = "..";
      });
    });
});

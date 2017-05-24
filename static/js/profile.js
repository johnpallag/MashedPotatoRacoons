"use strict";

$(document).ready(function() {
    $(".button-collapse").sideNav();
    EG.API.Account.authenticate(onAuthentication);

    function onAuthentication() {
        var player = EG.API.Account.currentPlayer;
        player.virus = player.virus || {};
        player.virus.params = player.virus.params || {};
        player.virus.color = player.virus.color || EG.API.Util.randColor();
        $("#accountName").text(player.name || "Your Name");
        $("#profileName").text(player.name || "Your Name");
        $("#profileUsername").text(player.username || "Your Username");
        var level = EG.API.Account.calcLevel();
        $("#accountLevel").text("level " + level);
        $("#accountPointsBar").css("width", EG.API.Account.levelCompletion() + "%");
        $("#profileLevelBar").css("width", EG.API.Account.levelCompletion() + "%");
        $("#stats-virusCount").text(EG.API.Account.currentPlayer.viruses.length);
        $("#stats-infectCount").text(EG.API.Account.currentPlayer.stats.infectedCount);
    }
});

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
        var level = EG.API.Account.calcLevel();
        $("#accountLevel").text("level " + level);
        $("#accountPointsBar").css("width", EG.API.Account.levelCompletion() + "%");
    }

    EG.API._Callbacks._ondata = function() {
        $("#leaderboard").html("");
        EG.API.Game.getLeaderboard(function(leaders) {
            var i = 1;
            leaders.forEach(function(leader) {
                var content = '<li class="collection-item avatar">' +
                    '<div class="circle">' + i + '</div>' +
                    '<span class="title">' + leader.username + '</span>' +
                    '<p>' + leader.name + '<br>' +
                    '  <span style="font-weight: bold;">' + (leader.score || 0) + ' Points</span>' +
                    '</p>' +
                    '<a href="#!" class="secondary-content"><i class="material-icons">grade</i></a>' +
                    '</li>';
                $("#leaderboard").append(content);
                i++;
            });
        });
    };
});

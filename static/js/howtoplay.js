$(document).ready(function() {
    $('.collapsible').collapsible();
    $(".button-collapse").sideNav();
    EG.API.Account.authenticate(onAuthentication);

    function onAuthentication() {
      $("#profileLink").show();
        var player = EG.API.Account.currentPlayer;
        player.virus = player.virus || {};
        player.virus.params = player.virus.params || {};
        player.virus.color = player.virus.color || EG.API.Util.randColor();
        $("#accountName").text(player.name || "Your Name");
        var level = EG.API.Account.calcLevel();
        $("#accountLevel").text("level " + level);
        $("#accountPointsBar").css("width", EG.API.Account.levelCompletion() + "%");
    }
    $("#logout_howtoplay").on("click",function(){
      EG.API.Account.logout(function(){
        location.href = "..";
      });
    });
});

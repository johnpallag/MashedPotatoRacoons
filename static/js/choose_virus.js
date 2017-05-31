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
  document.getElementById('yourinfection').innerHTML = "Time: " + infection + " day";
  document.getElementById('yourname').innerHTML = "Your Virus: " + document.getElementById(imagelink).innerHTML;

  document.getElementById('chosenvirus').src = "./img/virus_" + imagelink + ".png";
  document.getElementById('chosendistance').innerHTML = "Distanced: " + distance + " ft";
  document.getElementById('choseninfection').innerHTML = "Time: " + infection + " day";
  document.getElementById('chosenname').innerHTML = "Your Chosen Virus: " + document.getElementById(imagelink).innerHTML;
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
    padding: 0
  }); 

  $('.carousel').bind('DOMSubtreeModified', function(e) {
    console.log(e);
  });

  var options = document.getElementsByClassName("carousel-item");
  for (var i = 0; i < options.length; i++) {
    var element = options[0];
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutationRecord) {
        changeImage($(".carousel-item.active .virus-option").attr("data-image"),
          $(".carousel-item.active .virus-option").attr("data-distance"),
          $(".carousel-item.active .virus-option").attr("data-threshold"));
      });
    });

    observer.observe(element, {
      attributes: true,
      attributeFilter: ['style']
    });
  }

  $('.modal').modal();

  var player;
  if (location.href.indexOf("signup") > -1) {
    $("#loginmodel").show();
    $("#virusCreator").hide();
  } else {
	  $("#choose").addClass("disabled");
	  $("#choose").css("pointer-events","none");
	  EG.API.Account.authenticate(function(player){
		$("#choose").removeClass("disabled");
		$("#choose").css("pointer-events","all");
	    $("#logout_choosevirus").show();
	    $("#profileLink").show();
        
        document.getElementById('profilePic_Nav').src = "../choose_virus/img/virus_" + player.virus.params.image + ".png";
        $("#accountName").text(player.name || "Your Name");
        var level = EG.API.Account.calcLevel();
        $("#accountLevel").text("level " + level);
        $("#accountPointsBar").css("width", EG.API.Account.levelCompletion() + "%");
		
	  }, function(){
		  alert("Error getting account");
	  });
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
      threshold: d,
      lifetime: t
    };
    if (location.href.indexOf("signup") > -1) {
	  EG.API.Account.signup($("#username").val(), $("#password").val(), $("#name").val(), virus, function() {
	    location.href = "..";
	  }, alert);
    } else {
	  EG.API.Account.update(virus, function() {
	    location.href = "..";
	  }, alert);
	}
  });

 $("#logout_choosevirus").on("click",function(){
      EG.API.Account.logout(function(){
        location.href = "..";
      });
    });
});

$(document).ready(function(){
	var socket = null;	
	var messageInp = $("#message");
	var messageContainer = $("#messageContainer");
	var roomId = 0;
	
	var location = {};
	//Event handlers
	function sendMessage(){
		var message = messageInp.val();
		if(message.length!==0){
			addToMessageContainer(message, 1);
			socket.emit("sendMessage",{"message":message,"rId":roomId});
			messageInp.val('');
		}		
	}

	function init(){
		socket = io();
		addEventHandlers();
	}
	// 1 is me | 2 is other
	function addToMessageContainer(data, by){		
		if(by === 1){
			var data = document.createTextNode("You : "+data);
			messageContainer.append(data);
			messageContainer.append("</br>");
		}else{
			var data = document.createTextNode("Stranger : "+data);
			messageContainer.append(data);
			messageContainer.append("</br>");
		}
	}
	function addEventHandlers(){		
		$('#send').on('click', sendMessage);
		$(document).keypress(function(e){
			console.log("which "+e.which+" keyCode "+e.keyCode+" window "+window.event.keyCode);
			// + 
			if(e.which == 13 || e.keyCode == 13){
				sendMessage();
			}
		});
	}

	// Google Maps
	function initialize(){
		var mapCanvas = document.getElementById('map-canvas');
		var mapOptions = {
      		center: new google.maps.LatLng(location.la, location.lo),
      		zoom: 8,
      		mapTypeId: google.maps.MapTypeId.ROADMAP
		}
		var map = new google.maps.Map(mapCanvas, mapOptions);
	}

	init();	

	// socket event handlers
	socket.on("gotMessage", function(data){
		addToMessageContainer(data.message,2);
	});
	socket.on("myData", function(data){
		console.log(data);
		$('#message').attr('disabled',false);
		location.city = data.c;
		location.la = data.la;
		location.lo = data.lo;
		roomId = data.rm;
		$('#info').text('city : '+location.city);
		initialize();		
	});
	socket.on("finding", function(){
		console.log("finding");
		$('#status').text("Finding...");
	});
	socket.on("connecting", function(){
		console.log("connecting");
		$('#status').text("Connecting...");
	});
	socket.on("joint", function(){		
		console.log("joint");
		$('#status').text("Connected!");
	});
});

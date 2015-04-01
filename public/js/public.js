$(document).ready(function(){
	var socket = null;	
	var messageInp = $("#message");
	var messageContainer = $("#messageContainer");
	var roomId = 0;
	var disconnected = false;
	var location = {};
	//Event handlers
	function sendMessage(){
		var message = messageInp.val();
		//if not empty
		if(message.length!==0){
			addToMessageContainer(message, 1);
			socket.emit("sendMessage",{"message":message,"rId":roomId});			
			messageInp.val('');
		}
	}

	function init(){
		socket = io('/public');		
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
			messageContainer.append("</br></br>");
		}
		window.scrollTo(0, document.body.scrollHeight);
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
		// before close of tab ask if sure
		window.addEventListener("beforeunload", function (e) {
			if(!disconnected){
				var confirmationMessage = "Are you sure?";
				(e || window.event).returnValue = confirmationMessage; //Gecko + IE
				 return confirmationMessage;                      //Webkit, Safari, Chrome
				
			}
		});
		// on close of tab
		$( window ).unload(function() {
			if(!disconnected)
  				socket.emit("disconnect");
		});
		// on click of disconnect
		$( '#disconnect' ).click(function(){
			if(!disconnected)			
				socket.disconnect();
			disconnected = true;
			$('#status').text("Disconnected");

		});
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
		disconnected = false;
		console.log("joint");
		$('#status').text("Connected");
	});

	socket.on("error", function(data){
		alert(data);
	});
	socket.on("disconnected", function(data){
		disconnected = true;
		$('#status').text("Disconnected");	
	});
});

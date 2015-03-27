$(document).ready(function(){
	var socket = null;	
	var messageInp = $("#message");
	var messageContainer = $("#messageContainer");

	//Event handlers
	function sendMessage(){
		var message = messageInp.val();
		if(message.length!==0){
			addToMessageContainer(message, 1);
			socket.emit("sendMessage",{"message":message});
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
			messageContainer.append("</br><div class='me'>"+data+"</div>")
		}else{
			messageContainer.append("</br><div class='other'>"+data+"<div class='who'>Stranger</div></div>")
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

	init();	

	// socket event handlers
	socket.on("gotMessage", function(data){
		addToMessageContainer(data.message,2);
	});
});

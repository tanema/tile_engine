/*All code copyright 2010 by John Graham unless otherwise attributed*/

var Message = { //object to create messages (using alert in a game loop will crash your browser)
	message: 0, //hold element where messages will be added
	init: function(element){
		Message.message = element;
	},
	addMessage: function(msg){ //add new message
		if(Message.message){
			Message.message.innerHTML += '- '+msg+'<br />';
		}
	}
};

var FPS = {
	fps: 0, //hold element to display fps
	fps_count: 0, //hold frame count
	fps_timer: 0, //timer for FPS update (2 sec)
	init: function(element){
		FPS.fps = element;
		FPS.fps_timer = setInterval(FPS.updateFPS, 2000);
	},
	updateFPS: function(){ //add new message
		if(FPS.fps){
			FPS.fps.innerHTML = (FPS.fps_count / 2) + 'fps';
		}
		FPS.fps_count = 0;
	}
};

var Tracker = {
	tracker: 0,
	init: function(element){
		Tracker.tracker = element;
	},
	updateTracker: function(x,y){ 
		if(Tracker.tracker){
			Tracker.tracker.innerHTML = "Coordinates</br>x: " + x + "</br>y: " + y+ "</br>";
		}
	}
};

Message.init(document.getElementById('message'));
FPS.init(document.getElementById('fps'));
Tracker.init(document.getElementById('tracker'));
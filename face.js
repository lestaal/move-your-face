var videoInput;
var canvasInput;
var canvasOverlay;
var overlayContext;
var faceRectangle;
var fallingObjects;
var interval;
var numLives;
var colors = ["#FA6800", "#FAB700", "#FA3600", "#FA0000"];

function init() {
	videoInput = document.getElementById('inputVideo');
	canvasInput = document.getElementById('inputCanvas');
	canvasOverlay = document.getElementById('overlay');
	overlayContext = canvasOverlay.getContext('2d');
	numLives = 3;

	// initialize the headtracker
	var htracker = new headtrackr.Tracker({ui : false});
	htracker.init(videoInput, canvasInput);
	htracker.start();

	// for each facetracking event received draw rectangle around tracked face on canvas
	document.addEventListener("facetrackingEvent", function( event ) {
		// clear canvas
		overlayContext.clearRect(0,0,740,580);
		// once we have stable tracking, draw rectangle
		if (event.detection == "CS") {
			overlayContext.translate(event.x, event.y);
			overlayContext.rotate(event.angle-(Math.PI/2));
			overlayContext.strokeStyle = "#00CC00";
			overlayContext.strokeRect((-(event.width/2)) >> 0, (-(event.height/2)) >> 0, event.width, event.height);
			overlayContext.rotate((Math.PI/2)-event.angle);
			overlayContext.translate(-event.x, -event.y);
			
			faceRectangle = event;
			moveObjects();
		}
	});

}

function start() {
	// clear canvas
	overlayContext.clearRect(0,0,740,580);
	// initilaize falling objects
	fallingObjects = [];
	addObject();
	//window.setInterval(moveObjects, 500);
	interval = window.setInterval(addObject, 5000);
}

/* Inclusive on min and max */
function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addObject() {
	console.log("Adding a circle");
	fallingObjects.push(new Circle(randomInt(0,canvasOverlay.width), 0,
		randomInt(3, 10), randomInt(1,3), colors[randomInt(0,3)]));
}

function moveObjects() {
	console.log("Moving circles");
	var hit = false;
	for(var i = 0; i < fallingObjects.length; i++) {
		if(!fallingObjects[i].update()) {
			fallingObjects.splice(i, 1);
			i--;
			hit = true;
		}
		else if(fallingObjects[i].y - fallingObjects[i].radius >
			canvasOverlay.height) {
			fallingObjects.splice(i, 1);
			i--;
		}
	}
	if(hit) {
		onHit();
	}
}

function onHit() {
	console.log("hit");
	numLives--;
	document.getElementById("lives").innerHTML = numLives;
	if(numLives <= 0) {
		gameOver();
	}
}

function gameOver() {
	fallingObjects = [];
	window.clearInterval(interval);
	overlayContext.font="30px Gerogia";
	overlayContext.fillStyle = "#FA0000"
	overlayContext.fillText("Game Over", canvasOverlay.width/2 - 100, canvasOverlay.height/2 - 10);
}

function Circle(x, y, radius, velocity, color) {
	this.x = x;
	this.y = y;
	this.radius = radius;
	this.velocity = velocity;
	this.color = color;
	
	this.update = function() {
		this.move();
		this.draw();
		return this.isValid();
	}

	this.move = function() {
		this.y += velocity;
	}
	
	this.draw = function() {
		overlayContext.beginPath();
		overlayContext.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
		overlayContext.closePath();
		overlayContext.fillStyle = color;
		overlayContext.fill();
	}
	
	this.isValid = function() {
		if(this.x >= (faceRectangle.x - faceRectangle.width/2 - this.radius) &&
			this.x <= (faceRectangle.x + faceRectangle.width/2 + this.radius) &&
			this.y >= (faceRectangle.y - faceRectangle.height/2 - this.radius) &&
			this.y <= (faceRectangle.y + faceRectangle.height/2 + this.radius)) {
				console.log("circle: "+this.x+", "+this.y+" rectangle: "+faceRectangle.x+", "+faceRectangle.y);
				return false;
			}
		else {
			return true;
		}
	}
}
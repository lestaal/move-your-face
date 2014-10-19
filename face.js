var videoInput;
var canvasInput;
var canvasOverlay;
var overlayContext;
var faceRectangle;
var fallingObjects;
var badInterval;
var goodInterval;
var numLives;
var numPoints;
var started;
var badColors = ["#FA6800", "#FAB700", "#FA3600", "#FA0000"];
var goodColors = ["#18FFFF", "#039BE5", "#1DE9B6", "#00E5FF"];
var mustache;

var level2 = 100;	//mustache
var level3 = 200;	//monocle

var minVelocity = 1;
var maxVelocity = 4;

function init() {
	videoInput = document.getElementById('inputVideo');
	canvasInput = document.getElementById('inputCanvas');
	canvasOverlay = document.getElementById('overlay');
	overlayContext = canvasOverlay.getContext('2d');
	mustache = document.getElementById('mustache');
	monocle = document.getElementById('monocle');

	// line up overlay canvas with video
	var bounds = videoInput.getBoundingClientRect();
	canvasOverlay.style.top = bounds.top+"px";

	// initialize the headtracker
	var htracker = new headtrackr.Tracker({ui : false});
	htracker.init(videoInput, canvasInput);
	htracker.start();

	// for each facetracking event received draw rectangle around tracked face on canvas
	document.addEventListener("facetrackingEvent", function( event ) {
		// clear canvas
		overlayContext.clearRect(0,0,canvasOverlay.width,canvasOverlay.height);
		// once we have stable tracking, draw rectangle
		if (event.detection == "CS") {
			overlayContext.translate(event.x, event.y);
			overlayContext.rotate(event.angle-(Math.PI/2));
			overlayContext.strokeStyle = "#00CC00";
			overlayContext.strokeRect((-(event.width/2)) >> 0, (-(event.height/2)) >> 0, event.width, event.height);
			overlayContext.rotate((Math.PI/2)-event.angle);
			overlayContext.translate(-event.x, -event.y);
			
			if (numPoints >= level2) {
				mustache.style.display = "block";
				mustache.style.left = (canvasOverlay.width - event.x - 50)+"px";
				mustache.style.top = (event.y + 35)+"px";
			}
			if (numPoints >= level3) {
				monocle.style.display = "block";
				monocle.style.left = (canvasOverlay.width - event.x - 90)+"px";
				monocle.style.top = (event.y - 35)+"px";
			}

			faceRectangle = event;
			if (started) {
				moveObjects();
			}
		}
	});

}

function start() {
	// reset game values
	numLives = 3;
	document.getElementById("lives").innerHTML = numLives;
	numPoints = 0;
	document.getElementById("points").innerHTML = numPoints;
	mustache.style.display = "none";
	monocle.style.display = "none";
	// clear game over message
	document.getElementById("gameOver").style.display = 'none';
	// initilaize falling objects
	started = true;
	fallingObjects = [];
	addGood();
	goodInterval = window.setInterval(addGood, 2000);
	badInterval = window.setInterval(addBad, 10000);
}

/* Inclusive on min and max */
function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addBad() {
	fallingObjects.push(new Circle(randomInt(0,canvasOverlay.width), 0,
		randomInt(5, 15), randomInt(minVelocity,maxVelocity),
		badColors[randomInt(0,3)], false));
}

function addGood() {
	fallingObjects.push(new Circle(randomInt(0,canvasOverlay.width), 0,
		randomInt(5, 15), randomInt(minVelocity, maxVelocity),
		goodColors[randomInt(0,3)], true));
}

function moveObjects() {
	for(var i = 0; i < fallingObjects.length; i++) {
		if(!fallingObjects[i].update()) {
			fallingObjects.splice(i, 1);
			i--;
		}
		else if(fallingObjects[i].y - fallingObjects[i].radius >
			canvasOverlay.height) {
			if (!fallingObjects[i].good) {
				incrementPoints(5*fallingObjects[i].radius);
			}
			fallingObjects.splice(i, 1);
			i--;
		}
	}
}

function incrementPoints(num) {
	if (numPoints < level3 && numPoints + num >= level3) {
		window.clearInterval(badInterval);
		badInterval = window.setInterval(addBad, 5000);
		addBad();
		maxVelocity++;
	}
	else if (numPoints < level2 && numPoints + num >= level2) {
		window.clearInterval(badInterval);
		badInterval = window.setInterval(addBad, 7000);
		addBad();
		maxVelocity++;
	}
	numPoints += num;
	document.getElementById("points").innerHTML = numPoints;
}

function gameOver() {
	started = false;
	fallingObjects = [];
	window.clearInterval(badInterval);
	window.clearInterval(goodInterval);
	document.getElementById("lives").innerHTML = numLives;
	document.getElementById("gameOver").style.display = 'block';
}

function Circle(x, y, radius, velocity, color, good) {
	this.x = x;
	this.y = y;
	this.radius = radius;
	this.velocity = velocity;
	this.color = color;
	this.good = good;
	
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
				this.hit();
				return false;
		} else {
			return true;
		}
	}

	this.hit = function() {
		if (this.good) {
			incrementPoints(Math.ceil(0.75*this.radius));
		} else {
			numLives--;
			document.getElementById("lives").innerHTML = numLives;
			if(numLives <= 0) {
				gameOver();
			}
		}
	}
}
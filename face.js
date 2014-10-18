
function init() {
	var videoInput = document.getElementById('inputVideo');
	var canvasInput = document.getElementById('inputCanvas');
	var canvasOverlay = document.getElementById('overlay')
	var overlayContext = canvasOverlay.getContext('2d');

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
			overlayContext.translate(event.x, event.y)
			overlayContext.rotate(event.angle-(Math.PI/2));
			overlayContext.strokeStyle = "#00CC00";
			overlayContext.strokeRect((-(event.width/2)) >> 0, (-(event.height/2)) >> 0, event.width, event.height);
			overlayContext.rotate((Math.PI/2)-event.angle);
			overlayContext.translate(-event.x, -event.y);
		}
	});

}
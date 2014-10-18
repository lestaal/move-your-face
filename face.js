// initialize the headtracker
function init() {
	var videoInput = document.getElementById('inputVideo');
	var canvasInput = document.getElementById('inputCanvas');

	var htracker = new headtrackr.Tracker({ui : false});
	htracker.init(videoInput, canvasInput);
	htracker.start();
}
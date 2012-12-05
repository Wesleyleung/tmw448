function Tray (params) {
	this.tray = params.tray;
	this.trayButton = this.tray.find('#tray-handle');
	this.isOpen = false;
	this.playButton = this.tray.find('#tray-play');
	this.prograssBar = this.tray.find('#tray-progress-bar');

	this.trayButton.bind('click', function() {
		this.trayShowAndHide();
	}.bind(this));

	this.playButton.bind('click', function() {
		this.trayPlayAndPause();
	}.bind(this));
}

Tray.prototype =  {
	//Define functions here

	trayShowAndHide: function () {
		this.isOpen = !this.isOpen;
		if (this.isOpen) {
			this.trayButton.text("-");
			this.tray.animate({
			   bottom: 0
			}, 350);
		} else {
			this.trayButton.text("+");
			this.tray.animate({
			   bottom: this.tray.height() * -1
			}, 350);
		}
	},

	//Takes an optional argument true or false to set isPaused to
	trayPlayAndPause: function() {
		//If an argument is passed in, use it to set isPaused
		if (arguments.length == 0) isPaused = !isPaused;
		else isPaused = arguments[0];

		if (!isPaused) {
			this.playButton.removeClass('icon-play-circle');
			this.playButton.addClass('icon-pause');
			//loadPath from map.js
			loadPath();
		} else {
			this.playButton.addClass('icon-play-circle');
			this.playButton.removeClass('icon-pause');
		}
	}
};
function Tray (params) {
	this.tray = params.tray;
	this.trayButton = this.tray.find('#tray-handle');
	this.isOpen = false;
	this.playButton = this.tray.find('#tray-play');
	this.progressBarWrapper = this.tray.find('#tray-progress-wrapper');
	this.progressBar = this.tray.find('#tray-progress-bar');
	this.trayPlayControlsWrapper = this.tray.find('#tray-play-wrapper');

	this.trayButton.bind('click', function() {
		this.showAndHide();
	}.bind(this));

	this.playButton.bind('click', function() {
		this.playAndPause();
	}.bind(this));

	this.initTray();
}

Tray.prototype =  {
	//Define functions here
	initTray: function() {
		this.tray.css('bottom', this.tray.height() * -1 + this.trayPlayControlsWrapper.height());
		this.numProgressIntervals = 0;
		this.currentProgressInterval = 0;
	},

	setNumProgressIntervals: function(num) {
		this.numProgressIntervals = num;
	},

	setCurrentProgressInterval: function(num) {
		this.currentProgressInterval = num;
	},

	showAndHide: function () {
		this.isOpen = !this.isOpen;
		if (this.isOpen) {
			this.trayButton.text("-");
			this.tray.animate({
			   bottom: 0
			}, 350);
		} else {
			this.trayButton.text("+");
			this.tray.animate({
			   bottom: this.tray.height() * -1 + this.trayPlayControlsWrapper.height()
			}, 350);
		}
	},

	//Takes an optional argument true or false to set isPaused to
	playAndPause: function() {
		//If an argument is passed in, use it to set isPaused
		if (arguments.length == 0) isPaused = !isPaused;
		else isPaused = arguments[0];
		this.setProgressBarActiveState(isPaused);
		if (!isPaused) {
			this.playButton.html('<img src="img/pausebutton.png" />');
			//loadPath from map.js
			loadPath();
		} else {
			this.playButton.html('<img src="img/playbutton.png" />');
		}
	},

	//Only use this if numProgressIntervals and currentProgressInterval have been set
	animateProgressBarByInterval: function(interval) {
		this.currentProgressInterval += interval;
		var percentage = Math.round(this.currentProgressInterval / this.numProgressIntervals * 100);
		this.setProgressBarPercentage(percentage);
	},

	//Takes a value between 0 to 100 to set the progress bar to
	setProgressBarPercentage: function(percentage) {
		this.progressBar.width(percentage + "%");
	},

	//Takes a value true or false and sets the progress bar's activity state
	setProgressBarActiveState: function(isPaused) {
		if (!isPaused) {
			this.progressBarWrapper.addClass('progress-striped');
			this.progressBarWrapper.addClass('active');
		} else {
			this.progressBarWrapper.removeClass('progress-striped');
			this.progressBarWrapper.removeClass('active');
		}
	}
};
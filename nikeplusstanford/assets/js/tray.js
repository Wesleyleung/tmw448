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
		if (!isPaused) return false;
		var start_input = $("#start_date").val()
		var end_input = $("#end_date").val()

		if(!start_input|| !end_input) {
			modal.showModal("Not a Valid Date", '<p>Please enter a date range.</p>');
			return false;
		}
		start_date = new Date(start_input);
		end_date = new Date(end_input);
		if(start_date >= end_date) {
			modal.showModal("Not a Valid Date", '<p>Please select a start date after the end date.</p>');
			return false;
		}
		//If an argument is passed in, use it to set isPaused
		if (arguments.length == 0) isPaused = !isPaused;
		else isPaused = arguments[0];
		this.setProgressBarActiveState(isPaused);
		if (!isPaused) {
			this.playButton.html('<img src="' + static_file_url + 'img/pausebutton.png" />');
			this.playButton.css('cursor', 'progress');
			//slider.animateProgressBar();
			//graphPaths from map.js
			getHeatMapModel(generateHeatMap);
			
			graphPaths();
		} else {
			this.playButton.html('<img src="' + static_file_url + 'img/playbutton.png" />');
			this.playButton.css('cursor', 'pointer');
		}
	},

	//Returns in unixtime
	getStartDate: function() {
		return new Date($("#start_date").val()).getTime()/1000;
	},

	//Returns in unixtime
	getEndDate: function() {
		return new Date($("#end_date").val()).getTime()/1000;
	},

	//Only use this if numProgressIntervals and currentProgressInterval have been set
	animateProgressBarByInterval: function(interval) {
		this.currentProgressInterval += interval;
		if (this.currentProgressInterval <= 1) return;
		var percentage = Math.round(this.currentProgressInterval / this.numProgressIntervals * 100);
		this.setProgressBarPercentage(percentage);
	},

	//Takes a value between 0 to 100 to set the progress bar to
	setProgressBarPercentage: function(percentage) {
		/*this.progressBar.animate({
			width: percentage + "%"
		}, 10);*/
		this.progressBar.width(percentage + "%");
	},

	//Takes a value true or false and sets the progress bar's activity state
	setProgressBarActiveState: function(isPaused) {
		if (!isPaused) {
			this.progressBarWrapper.addClass('progress-striped');
			this.progressBarWrapper.addClass('active');
			this.playButton.html('<img src="' + static_file_url + 'img/pausebutton.png" />');
			this.playButton.css('cursor', 'progress');
		} else {
			this.progressBarWrapper.removeClass('progress-striped');
			this.progressBarWrapper.removeClass('active');
			this.playButton.html('<img src="' + static_file_url + 'img/playbutton.png" />');
			this.playButton.css('cursor', 'pointer');
		}
	}
};
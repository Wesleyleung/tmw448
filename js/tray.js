function Tray (params) {
	this.tray = params.tray;
	this.trayButton = this.tray.find('#tray-handle');
	this.isOpen = false;
	this.playButton = this.tray.find('#tray-play').find('i');
	this.prograssBar = this.tray.find('#tray-progress-bar');

	this.trayButton.bind('click', function() {
		this.trayShowAndHide();
	}.bind(this));

	this.playButton.bind('click', function() {
		this.trayPlayAndPause();
	}.bind(this));
}

Tray.prototype =  {
	fn: function(args) {
		//this is a template for a function
	},

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

	trayPlayAndPause: function() {
		//icon-pause
		isPaused = !isPaused;
		if (!isPaused) {
			loadPath();
			this.playButton.removeClass('icon-play-circle');
			this.playButton.addClass('icon-pause');
		} else {
			this.playButton.addClass('icon-play-circle');
			this.playButton.removeClass('icon-pause');
		}
	}
};
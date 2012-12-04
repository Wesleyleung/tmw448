function Tray (params) {
	this.tray = params.tray;
	this.trayButton = this.tray.find('#tray-handle');
	this.isOpen = false;
	console.log(this.tray.find('#tray-handle'));
	this.trayButton.bind('click', function() {
		this.trayClick();
	}.bind(this));
}

Tray.prototype =  {
	fn: function(args) {
		//this is a template for a function
	},
	trayClick: function (args) {
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
		
	}
};
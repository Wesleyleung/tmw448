function Slider (params) {
	this.slider = params.slider;
	this.animationTime = 10000;
	this.timeStartedAnimating = 0;
	this.initSlider();
	//this.animateSliderOverTime();
	//this.readSliderWhileAnimating();
}

Slider.prototype =  {
	initSlider: function() {
		this.slider.slider({
			range: "min",
            value: 0,
            min: 0,
            max: this.animationTime,
            //on user slide
            slide: function( event, ui ) {
            	console.log("slide");
                console.log(event);
                console.log(ui);
                			console.log(this.slider.slider("widget"));

            }.bind(this),
            //on change of value programatically
            change: function( event, ui) {
            	/*console.log("change");
            	console.log(event);
                console.log(ui);*/
            }.bind(this)
		});
		this.bar = this.slider.children("div");
		this.slideElement = this.slider.children("a");
		//set slider color
		this.bar.css("background","#0D90D1");

		//disable slide drag
		this.slideElement.mousedown(function() { return false; });
	},
	/*
	on start button click, store current system time.
	each 5ms or so, read the system time, take the difference, use that as the time elapsed
	*/

	//If millis is specified, uses that.  else it uses 10 seconds
	animateSliderOverTime: function() {
		console.log("ere");
		this.slider.slider('option', 'animate', this.animationTime);
		this.slider.slider('value', this.slider.slider('option', 'max'));
		this.timeStartedAnimating = new Date().getTime();
		this.readSliderWhileAnimating();
	},

	animateProgressBar: function() {
		var interval = 15;
		setInterval(function() {
			if (this.sliderValue() >= this.animationTime) {
				clearInterval();
				tray.playAndPause(true);
			}
			this.slider.slider('value', this.sliderValue() + interval);
		}.bind(this), interval);
	},

	sliderValueWhileAnimating: function() {

	},

	sliderValue: function() {
		return this.slider.slider('option', 'value');
	},

	//Fires every 5 ms while the slider is moving and returns the value of the slider
	readSliderWhileAnimating: function() {
		if (!this.slideElement.is(':animated')) {
			return;
		}
		setInterval(function() {
			var now = new Date().getTime();
			if (!this.slideElement.is(':animated')) {
				clearInterval();
				console.log(now - this.timeStartedAnimating);
			}
		}.bind(this), 10);
	}
}
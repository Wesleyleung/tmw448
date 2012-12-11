function Graph(params) {
	this.jqueryGraph = params.graph;
	this.graphIDString = params.graphDivName;

	this.barToShowIndex = 0;
	this.barArray = [];

	this.initGraph();

	$('body').bind('keypress', function() {
		this.animateNextBar();
	}.bind(this));
}

Graph.prototype = {
	initGraph: function() {
		var margin = {top: 5, right: 0, bottom: 0, left: 0},
			numDays = 10;
			this.width = this.jqueryGraph.parent().width() - margin.left - margin.right;
			this.height = 200 - margin.top - margin.bottom;
			 //this should come from the json response
		
		this.barWidth = Math.floor(this.width / (numDays + 1)) - 2;

		this.x = d3.scale.linear()
			.range([this.barWidth / 2, this.width - this.barWidth / 2 - 2]);

		this.y = d3.scale.linear()
			.range([0, this.height]);

		var yAxis = d3.svg.axis()
			.scale(this.y)
			.orient("right")
			.tickSize(-this.width)
			.tickFormat(function(d) { return ""; });

		// An SVG element with a bottom-right origin.
		this.svg = d3.select(this.graphIDString).append("svg")
			.attr("width", this.width + margin.left + margin.right)
			.attr("height", this.height + margin.top + margin.bottom)
			.append("g") // do i need this?
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
			//.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		// A sliding container to hold the bars by birthyear.
		var days = this.svg.append("g")
			.attr("class", "days");

		// A label for the current year.
		var title = this.svg.append("text")
			.attr("class", "title")
			.attr("dy", ".71em")
			.text(2000);

		//this should be the json response and not test csv file
		d3.csv(static_file_url + "js/export.csv", function(error, data) {

			// Update the scale domains.
			this.x.domain([0, data.length]);
			this.y.domain([0, d3.max(data, function(d) { return parseInt(d.FUEL_AMT); })]);

			// Add an axis to show the day values.
			// this.svg.append("g")
			// 	.attr("class", "y axis")
			// 	.attr("transform", "translate(" + (this.width - 95) + ",0)")
			// 	.call(yAxis)
			// 	.selectAll("g")
			// 	.filter(function(value) { return !value; });
				//.classed("major", true);

			// Add labeled rects for each postal code.
			var singleDay = days.selectAll(".days")
				.data(data)
				.enter().append("g")
				.attr("class", "day")
				.attr("transform", function(d, i) { return "translate(" + this.x(i) + ",-5)"; }.bind(this));

			singleDay.selectAll("rect")
				.data(function(d, i) { return [d]; });

			// Add labels to show birthyear.
			// singleDay.append("text")
			// 	.attr("y", this.height - 5)
			// 	.text(function(d, i) { return "Day " + (i + 1); });

			// singleDay.append("text")
			// 	.attr("y", function(d) { return this.height - this.y(parseInt(d.FUEL_AMT)) + 10; }.bind(this))
			// 	.text(function(d, i) { return d.FUEL_AMT; });
		}.bind(this));
	},

	animateNextBar: function() {
		var days = this.svg.selectAll(".day")[0];
		this.animateBar(days[this.barToShowIndex]);
		this.barToShowIndex ++;
	},

	animateBar: function(node) {
		node = d3.select(node);
		node
			.append("rect")
			.attr("x", -this.barWidth / 2)
			.attr("width", this.barWidth)
			.attr("y", this.height)
			.transition()
			.duration(700)
			.attr("y", function(d) { return this.height - this.y(parseInt(d.FUEL_AMT)); }.bind(this))
			.attr("height", function(d) { return this.y(parseInt(d.FUEL_AMT)); }.bind(this));

		node.append("text")
			.attr("text-anchor", "middle")
			.attr("y", this.height + 10)
			.transition()
			.duration(700)
			.attr("y", function(d) { return this.height - this.y(parseInt(d.FUEL_AMT)) + 10; }.bind(this))
			.text(function(d, i) { return d.FUEL_AMT; });
	}
}
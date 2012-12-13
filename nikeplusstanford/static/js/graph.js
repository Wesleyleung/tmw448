function Graph(params) {
	this.jqueryGraph = params.graph;
	this.graphIDString = params.graphDivName;
	this.graphInfo = params.graphInfo;

	console.log(this.graphInfo);

	this.barToShowIndex = 0;
	this.barArray = [];
}

Graph.prototype = {

	initGraphWithJsonObject: function(json) {
		//Remove the old graph
		if (this.svg) d3.select("svg").remove();
		var data = JSON.parse( json );

		var margin = {top: 5, right: 0, bottom: 0, left: 0};
			this.numDays = data.data.length;
			this.width = this.jqueryGraph.parent().width() - margin.left - margin.right;
			this.height = 200 - margin.top - margin.bottom;
			 //this should come from the json response
		
		this.barWidth = Math.floor(this.width / this.numDays);

		this.x = d3.scale.linear()
			.range([this.barWidth / 2, this.width - this.barWidth / 2]);

		this.y = d3.scale.linear()
			.range([this.height, 0]);

		var yAxis = d3.svg.axis()
    		.scale(this.y)
    		.orient("left");

		// An SVG element with a bottom-right origin.
		this.svg = d3.select(this.graphIDString).append("svg")
			.attr("width", this.width + margin.left + margin.right)
			.attr("height", this.height + margin.top + margin.bottom)
			.append("g") // do i need this?
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		// A sliding container to hold the bars by birthyear.
		var days = this.svg.append("g")
			.attr("class", "days");


		// Update the scale domains.
		this.x.domain([0, this.numDays - 1]);
		this.y.domain([0, data.maxFuelInRange]);

		//Add an axis to show the day values.
		this.svg.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(" + (this.width) + ",0)")
			.call(yAxis)
			.selectAll("g");


		// Add labeled rects for each postal code.
		var singleDay = days.selectAll(".days")
			.data(data.data)
			.enter().append("g")
			.attr("class", "day")
			.attr("transform", function(d, i) { return "translate(" + this.x(i) + ",-5)"; }.bind(this));

		singleDay.selectAll("rect")
			.data(function(d, i) { return [d]; })
			.enter().append("rect")
			.attr("x", -this.barWidth / 2)
			.attr("width", this.barWidth)
			.attr("y", this.height)
			.on("mouseover", this.over)
       		.on("mouseout", this.out)
			.transition()
			.duration(700)
			.attr("y", function(d) { return this.y(parseInt(d.totalFuel)); }.bind(this))
			.attr("height", function(d) { return this.height - this.y(parseInt(d.totalFuel)); }.bind(this));

		// Add labels to show birthyear.
		// singleDay.append("text")
		// 	.attr("text-anchor", "middle")
		// 	.attr("y", this.height)
		// 	.transition()
		// 	.duration(700)
		// 	.attr("y", function(d) { return this.height - this.y(parseInt(d.totalFuel)) + 10; }.bind(this))
		// 	.text(function(d, i) { return d.totalFuel; });
	//}.bind(this));
	},
	over: function(d) {
		var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', "Jul", 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		var coords = d3.mouse(this.parentNode.parentNode);
		var xcoord = coords[0] + 5;
		var ycoord = coords[1] + 10;
		var maxWidth = $('#d3-graph').width();
		var maxHeight = $('#d3-graph').height();
		if (xcoord + 300 > maxWidth) xcoord = coords[0] - 305;

		var date = new Date(d.date*1000);
		var dateStr = month[date.getMonth()] + ", " + date.getDate() + " " + date.getFullYear();
		console.log(dateStr);
	   
	    $('#graph-info').html(dateStr + ": " + d.totalFuel + " fuel points earned");
	    $('#graph-info').css("background", "rgba(0, 0, 0, 0.7)");
	},

	out: function(d) {
		d3.select(this.parentNode.parentNode).select(".infoBox").remove();
		$('#graph-info').html("");
		$('#graph-info').css("background", "none");
	},

	animateNextBar: function() {
		var days = this.svg.selectAll(".day")[0];
		this.animateBar(days[this.barToShowIndex]);
		this.barToShowIndex ++;
	},

	animateBar: function(node) {
		node = d3.select(node);
		/*node
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
			.text(function(d, i) { return d.FUEL_AMT; });*/
	}
}
/*global tdgchart: false, d3: false */
/* Copyright 1996-2015 Information Builders, Inc. All rights reserved. */

(function() {

	function drawOneChart(renderConfig, container, cellData, w, h) {

		var chart = renderConfig.moonbeamInstance;
		var pad = 10;
		var labels = cellData.map(function(el) {return el.labels;});
		var x = d3.scale.ordinal().domain(labels).rangeRoundBands([pad, w - pad], 0.2);
		var ymax = d3.max(cellData, function(d) {return d.value;});
		var y = d3.scale.linear().domain([0, ymax]).range([h - pad, pad]);

		// Draw axis divider line
		container.append('path')
			.attr('d', 'M' + pad + ',' + (y(0) + 1) + 'l' + (w - pad - pad) + ',0');

		// Draw risers
		container.selectAll('rect')
			.data(cellData)
			.enter().append('rect')
			.attr('x', function(d) {return x(d.labels);})
			.attr('y', function(d) {return y(d.value);})
			.attr('width', x.rangeBand())
			.attr('height', function(d) {return Math.abs(y(d.value) - y(0));})
			.attr('fill', chart.getSeriesAndGroupProperty(0, null, 'color'));
	}

	function renderCallback(renderConfig) {

		var data = renderConfig.data;
		var rowCount = data.length;
		var colCount = d3.max(data, function(el) {return el.length;});
		var cellWidth = renderConfig.width / colCount
		var cellHeight = renderConfig.height / rowCount;

		var container = d3.select(renderConfig.container).attr('class', 'extension_container').append('g');

		var rows = container.selectAll('g')
			.data(data)
			.enter().append('g')
			.attr('transform', function(d, r) {
				return 'translate(0, ' + (r * cellHeight) + ')';
			});

		var cols = rows.selectAll('g')
			.data(function(d) {return d;})
			.enter().append('g')
			.attr('transform', function(d, c) {
				return 'translate(' + (c * cellWidth) + ', 0)';
			})
			.each(function(d) {
				drawOneChart(renderConfig, d3.select(this), d, cellWidth, cellHeight);
			});

		renderConfig.renderComplete();
	}

	var config = {
		id: 'com.ibi.tutorial_matrix',
		containerType: 'svg',
		renderCallback: renderCallback,
		resources: {
			script: ['../lib/d3.js'],
			css: ['../lib/style.css']
		},
		modules: {
			tooltip: {
				supported: true,  // Set this true if your extension wants to enable HTML tooltips
				// This callback is called when no default tooltip content is passed into the chart.
				// Use this to define 'nice' default tooltips for the given target, ids & data.
				// Return value can be a string (including HTML), or HTML nodes, or any Moonbeam tooltip API object.
				autoContent: function(target, s, g, d) {
					if (d.hasOwnProperty('color')) {
						return 'Bar Size: ' + d.value + '<br />Bar Color: ' + d.color;
					}
					return 'Bar Size: ' + d.value;
				}
			}
		}
	};

	tdgchart.extensionManager.register(config);
})();

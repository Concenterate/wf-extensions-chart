(function() {

    //Set the Global IBI Variable if not exists
    if(typeof window.$ib3 == 'undefined') {
        //console.log("Global variable window.$ib3 doesn't exist. ");
		window.$ib3 = {};
	}
	
	var chart = {
		draw: _draw
	};
	
	window.$ib3.chart = chart;
	
	function _draw(isDummyData) {
		
		$ib3.config.checkServiceIsInitinalized();
		
		//Declare main extension vars
		var data = $ib3.config.getData(),
			mainContainer = $ib3.config.getContainer(),
			chart = $ib3.config.getChart(),
			width = $ib3.config.getChartWidth(),
			height = $ib3.config.getChartHeight(),
			properties = $ib3.config.getCustomProperties();
			
		var barWidth = width,
			minColor = isDummyData ? 'grey': $ib3.config.getProperty('colors.minColor'),
			maxColor = isDummyData ? '#5a5a5a': $ib3.config.getProperty('colors.maxColor'),
			textColor = isDummyData ? 'grey': $ib3.config.getProperty('colors.titlesColor'),
			marginTop = parseFloat($ib3.config.getProperty('sizes.marginTop')),
			rowHeight = parseFloat($ib3.config.getProperty('sizes.rowHeight')),
			barHeight = parseFloat($ib3.config.getProperty('sizes.barHeight')),
			animationSeconds = 500,
			fontSize = $ib3.config.getProperty('sizes.titlesFont');
					
		var container = d3.select(mainContainer).attr('class', 'extension_container').append('g');

		var groups = container.selectAll('g')
			.data(data)
			.enter()
				.append('g')
				.each(function(d, g) {
					$ib3.utils.setUpTooltip(this, 0, g, d);
				})
				.attr("class", function(d, i) {
					var drillClass = $ib3.config.getDrillClass(0, i);
					return drillClass;
				});

		var valueFormat = $ib3.config.getFormatByBucketName('value', 0);
		
		groups.append('text')
			.attr('class', 'title')
			.attr('fill', textColor)
			.attr('alignment-baseline', 'central')
			.attr('font-size', fontSize)
			.attr('y', function(d, i) { 
				return i * rowHeight + marginTop;
			})
			.text(function(d) { 
				var number;
				
				var abbr = $ib3.utils.getNumericAbbreviation(d.value),
					shortenNumber = $ib3.utils.getShortenNumberByAbbreviation(d.value, abbr),
					valueFormatApplied = valueFormat;
					
				var lastCharValueFormat = valueFormatApplied.substring(valueFormatApplied.length - 1);
				if(lastCharValueFormat == '%') {
					valueFormatApplied += abbr;								
				} else if(lastCharValueFormat == '€') {
					valueFormatApplied = valueFormatApplied.substring(0, valueFormatApplied.length - 2) + abbr + lastCharValueFormat;
				} else {
					valueFormatApplied += abbr;
				}
				
				$ib3.config.formatNumber(shortenNumber, valueFormatApplied); 
							
				return d.dimension + '   ' +
					$ib3.config.formatNumber(shortenNumber, valueFormatApplied);
			});

		groups.append('rect')
			.attr('class', 'bg-rect')
			.attr('fill', '#d1d1d1')
			.attr('height', barHeight)
			.attr('width', barWidth)
			.attr('y', function(d, i) { 
				return i * rowHeight + rowHeight / 4 + marginTop;
			});

		var progress = groups.append('rect')
			.attr('class', 'progress-rect')
			.attr('fill', 'gray')
			.attr('height', barHeight)
			.attr('width', 0)
			.attr('y', function(d, i) {
				return i * rowHeight + rowHeight / 4 + marginTop;
			})
			.attr('x', 0);
		
		var defaultMin = 0,
			defaultMax = $(data).map(function(i,d) { return d.value }).get().reduce(function(total, elem) { return total + elem }),
			bucketMinValue = $ib3.config.getBucket('minvalue'),
			bucketMaxValue = $ib3.config.getBucket('maxvalue');

		var colorDefaultScale = d3.scaleLinear()
			.domain([0, defaultMax])
			.range([minColor, maxColor]);

		var widthDefaultScale = d3.scaleLinear()
			.domain([0, defaultMax])
			.range([0, barWidth]);
		
		progress
			.transition()
			.duration(animationSeconds)
			.attr('width', function(d) { 
				var widthScale = widthDefaultScale,
					hasMinValue = typeof d.minvalue != 'undefined',
					hasMaxValue = typeof d.maxvalue != 'undefined';
					
				if (hasMinValue || hasMaxValue) {
					
					widthScale = d3.scaleLinear()
						.domain([hasMinValue ? d.minvalue : 0, hasMaxValue ? d.maxvalue : defaultMax])
						.range([0, barWidth]);
						
				}
				
				return widthScale(d.value) 
			})
			.attr('fill', function(d) { 
			
				var colorScale = colorDefaultScale,
					hasMinValue = typeof d.minvalue != 'undefined',
					hasMaxValue = typeof d.maxvalue != 'undefined';
					
				if (hasMinValue || hasMaxValue) {
					
					colorScale = d3.scaleLinear()
						.domain([hasMinValue ? d.minvalue : 0, hasMaxValue ? d.maxvalue : defaultMax])
						.range([minColor, maxColor]);
						
				}
				
				return colorScale(d.value) 
			})
						
		$ib3.utils.createScrolling(d3.select(mainContainer), d3.select('svg > rect'), d3.select('svg'));
	}
	
}())
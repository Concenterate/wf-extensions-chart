(function() {
    tdgscatter = typeof tdgscatter !== 'undefined' ? tdgscatter : {};
    tdgscatter.circles = tdgscatter.circles || {};
    tdgscatter.circles.init = circlesInit;

    function circlesInit(config) {

        var props = {
            x: null,
            y: null,
            data: [],
            radius: 2
        };

        var innerProps = {};

        if (config && config.constructor === Object) {
            for (var key in config) {
                if (config.hasOwnProperty(key)) {
                    props[key] = config[key];
                }
            }
        }

        return function(d3_container) {
            var circles_group = d3_container.append('g').classed("circles", true);

            var circles = circles_group.selectAll('circle')
                .data(props.data);
			debugger;
			
            circles.enter().append('circle')
                .attr({
                    cx: function(d) {
                        return props.x(d.x);
                    },
                    cy: function(d) {
                        return props.y(d.y);
                    },
                    r: props.radius
                }).filter(function(d){
					return d.detail != null;
				}).attr('tdgtitle', function(d){
					var str = '', keys = Object.keys(d.detail);
					keys.forEach(function(key, idx){
						if (idx) {
							str += '<br/>';
						}
						str += '<b>' + key + ': </b>';
						str += d.detail[key];
					});
					return str;
				});
        };
    }
})();
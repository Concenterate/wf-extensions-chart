/* jshint eqnull:true*/
/* globals d3*/

var tdg_sunburst = (function () {

  function copyIfExisty (src, trgt) {
    each(src, function (attr, key) {
      if ( isObject(attr) && isObject(trgt[key]) ) {
        copyIfExisty(attr, trgt[key]);
      } else if (trgt[key] != null && !isObject(src[key])) {
        src[key] = trgt[key];
      }
    });
  }

  function isObject (o) {
    return o && o.constructor === Object;
  }

  function each (obj, cb) {
    if ( Array.isArray(obj) ) {
      for (var i = 0; i < obj.length; i++) {
        cb(obj[i], i, obj);
      }
      obj.forEach(cb);
    } else if ( isObject(obj) ) {
      for (var key in obj) {
        if ( obj.hasOwnProperty(key) ) {
          cb(obj[key], key, obj);
        }
      }
    }
  }

  // converts moonbeam hierarchical dataset into the one that d3.layout.partition requires
  function getFixedDataSet (data, fakeRootName) {
    var roots , root;
    if ( !Array.isArray(data) ) {
      return;
    }

    data = data.map(function (d) {
      return {
        parent: d.level1 ? d.level1 : d.parent,
        node: d.level2 ? d.level2 : d.node,
        value: d.value
      };
    });

    var nodes = [];

    data.forEach(function (d) {
      if ( typeof d.parent === 'string' && nodes.indexOf(d.parent) < 0 ) {
        nodes.push(d.parent);
      }
      if ( typeof d.parent === 'string' && nodes.indexOf(d.node) < 0 ) {
        nodes.push(d.node);
      }
    });

    nodes.forEach(function (name) {
      if ( data.every(function (d) { return d.node !== name;}) ) {
        data.push({
          node: name,
          parent: null
        });
      }
    });

    roots = data.filter(function(d){ return d.parent == null; });

    if ( roots.length > 1 ) {
      root = {
        node: fakeRootName,
        parent: null,
        value: null,
        _fake: true
      };
      data.push(root);
      roots.forEach(function (d) {
        d.parent = root.node;
      });
    } else {
      root = roots[0];
    }

    var result = {},
      children;

    (function iterate (parent, dObj) {
      dObj.name = parent.node;
      children = data.filter(function(d){ return d.parent === parent.node; });
      if ( children.length ) {
        dObj.children = [];
        children.forEach(function (child) {
          var childDObj = {};
          iterate(child, childDObj);
          dObj.children.push(childDObj);
        });
      } else { // leaf
        dObj.size = parent.value || 0;
      }
    })(root, result);

    return result;
  }

  function getFixedDataSetOld (data, fakeRootName) {
    var roots , root;
    if ( !Array.isArray(data) ) {
      return;
    }

    roots = data.filter(function(d){ return d.parent == null; });

    if ( roots.length > 1 ) {
      root = {
        node: fakeRootName,
        parent: null,
        value: null,
        _fake: true
      };
      data.push(root);
      roots.forEach(function (d) {
        d.parent = root.node;
      });
    } else {
      root = roots[0];
    }

    var result = {},
      children;

    (function iterate (parent, dObj) {
      dObj.name = parent.node;
      children = data.filter(function(d){ return d.parent === parent.node; });
      if ( children.length ) {
        dObj.children = [];
        children.forEach(function (child) {
          var childDObj = {};
          iterate(child, childDObj);
          dObj.children.push(childDObj);
        });
      } else { // leaf
        dObj.size = parent.value || 0; 
      }
    })(root, result);

    return result;
  }

	return function (user_props) {
    // functions declared here will have access to props and innerProps object
		var props = {
			width: 300,
			height: 400,
			data: null,
      node: {
        colors: ["#4087b8","#e31a1c","#9ebcda","#c994c7","#41b6c4","#49006a","#ec7014","#a6bddb","#67001f","#800026","#addd8e","#e0ecf4","#fcc5c0","#238b45","#081d58","#d4b9da","#2b8cbe","#74a9cf","#41ab5d","#fed976","#ce1256","#7f0000","#a6bddb","#ffffcc","#e7e1ef","#016c59","#f7fcfd","#99d8c9","#fff7fb","#ffffe5","#fdd49e","#ffffd9","#fe9929","#8c96c6","#810f7c","#993404","#c7e9b4","#bfd3e6","#e7298a","#7fcdbb","#3690c0","#ae017e","#d9f0a3","#ece2f0","#014636","#f7fcb9","#66c2a4","#fff7bc","#f7fcf0","#e5f5f9","#fdbb84","#fa9fb5","#4d004b","#fff7fb","#cc4c02","#78c679","#1d91c0","#ccebc5","#feb24c","#b30000","#8c6bb1","#fec44f","#d0d1e6","#084081","#0868ac","#f7fcfd","#0570b0","#ef6548","#fff7ec","#006837","#f768a1","#edf8b1","#fee391","#238443","#ffffe5","#023858","#7a0177","#67a9cf","#dd3497","#980043","#88419d","#d0d1e6","#fc8d59","#4eb3d3","#fd8d3c","#fff7f3","#fc4e2a","#ccece6","#ece7f2","#a8ddb5","#41ae76","#bd0026","#e0f3db","#045a8d","#ffeda0","#253494","#7bccc4","#fde0dd","#00441b","#225ea8","#006d2c","#02818a","#f7f4f9","#d7301f","#df65b0","#662506","#3690c0","#004529","#fee8c8"],
        colorBy: 'node', // 'parent', node
        border: {
          color: 'white',
          width: 2
        }
      },
      toolTip: {
        enabled: true,
        elements: [
          {
            name: 'name'
          },
          {
            name: 'value',
            format: 'd'
          },
          {
            name: 'ratio',
            format: '%',
            hideForRoot: true
          }
        ]
      }
		};

    var innerProps = {
      radiusRatio: 0.95,
      fakeRootName: '<__FaKe_rOOt__>'
    };

		copyIfExisty(props, user_props || {});

		function createAccessor (attr) {
			function accessor (value) {
				if (!arguments.length) { return props[attr]; }
				props[attr] = value;
				return chart;
			}
			return accessor;
		}

    function getData () {
      return props.data;
    }

    function getRandomInRange (start, end) {
      var r = end - start;
      return Math.round( start + Math.random() * r);
    }

    function getRandomColor () {
      return d3.rgb(getRandomInRange(0,255), getRandomInRange(0,255), getRandomInRange(0,255)).toString();
    }

    function getColors (num) {
      var colors = props.node.colors;
      if ( num < colors.length ) {
        return colors.slice(0, num);
      } else {
        var restCount = num - colors.length;

        for ( var i = 0; i < restCount; i++ ) {
          colors.push(getRandomColor());
        }
        return colors.slice(0, num);
      }
    }

    function getDiscreteColorScale (sunburstData) {
      var groups = sunburstData.map(function (d) {
        return getGroup(d);
      }).reduce(function (uniq, nodeId) {
        return ( uniq.indexOf(nodeId) < 0 ) ? uniq.concat(nodeId) : uniq;
      }, []);

      return d3.scale.ordinal().domain(groups).range(getColors(groups.length));
    }

    function getGroup (d) {
      if ( props.node.colorBy === 'parent' ) {
        return ( d.parent ) ? d.parent.name : null;
      } else if ( props.node.colorBy === 'node' ) {
        return d.name;
      }
    }

    function getToolTipBuilder () {
      var formatMap = {};
      props.toolTip.elements.filter(function (el) {
        return typeof el.format === 'string';
      }).forEach(function (el) {
        formatMap[el.name] = d3.format(el.format);
      });

      return function (d) {
        var str = '<div style="padding:5px">';

        props.toolTip.elements.forEach(function (el, idx) {
          if ( el.hideForRoot && d === findRoot(d)) {
            return;
          }
          if (idx) {
            str += '<br/>';
          }
          str += '<b>' + el.name + ': </b>';

          str += (formatMap[el.name]) ? formatMap[el.name](d[el.name]) : d[el.name];
        });

        str += '</div>';
        return str;
      };
    }

    function getRatio (d) {
      var root = findRoot(d);
      return d.value / root.value;
    }

    function findRoot (d) {
      var root;
      (function iterate (node) {
        if ( node.parent && node.parent.name !== innerProps.fakeRootName) {
          iterate(node.parent);
        } else {
          root = node;
        }
      })(d);
      return root;
    }

    function renderSunburst (group_main) {
      var data = getFixedDataSet(getData(), innerProps.fakeRootName);

      var radius = Math.min( props.width, props.height ) / 2 * innerProps.radiusRatio;

      var x = d3.scale.linear().range([0, 2 * Math.PI]);

      var y = d3.scale.sqrt().range([0, radius]);
      
      var group_chart = group_main.append('g').classed('group-chart', true)
        .attr('transform', 'translate(' + props.width / 2 + ',' + props.height / 2 + ')');

      var partition = d3.layout.partition()
        .value(function(d) { return d.size; });

      var sunburstData = partition.nodes(data);

      sunburstData.forEach(function (d) {
        d.ratio = getRatio(d);
      });

      var colorScale = getDiscreteColorScale(sunburstData);

      var arc = d3.svg.arc()
        .startAngle(function(d) {
          return Math.max(0, Math.min(2 * Math.PI, x(d.x)));
        })
        .endAngle(function(d) {
          return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));
        })
        .innerRadius(function(d) {
          return Math.max(0, y(d.y));
        })
        .outerRadius(function(d) {
          return Math.max(0, y(d.y + d.dy));
        });

      var paths = group_chart.selectAll('path.node')
        .data(sunburstData)
        .enter().append('path').classed('node', true);

      paths.attr({
          d: arc
        })
        .style({
          fill : function (d) {
            return ( d.name !== innerProps.fakeRootName ) ? colorScale(getGroup(d)) : 'none';
          },
          stroke: props.node.border.color,
          'stroke-width': props.node.border.width,
          opacity: 0
        })
        .on('click', click)
        .filter(function (d) { // get all the nodes besides root
          return d.name !== innerProps.fakeRootName;
        })
        .on('mouseover', fade(0.2))
        .on('mouseout', fade(1));

      paths.filter(function (d) {
        return d.name === innerProps.fakeRootName;
      }).attr('pointer-events', 'all');
      
      paths.transition().delay(function (d, i) {
        return 50 * (paths[0].length - i );
      }).duration(800).style('opacity', 1);

      if ( props.toolTip.enabled ) {
        paths
          .filter(function (d) { // get all the nodes besides root
            return d.name !== innerProps.fakeRootName;
          })
          .attr('tdgtitle', getToolTipBuilder());
      }

      function click (d) {
        paths.transition()
          .duration(750)
          .attrTween("d", arcTween(d));
      }

      function fade (opacity) {
        return function (select_d) {
          var filteredPaths = paths.filter(function (path_d) {
            return select_d.name !== path_d.name;
          });

          filteredPaths.transition().style('opacity', opacity);
        };
      }

      function arcTween (d) {
        var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
          yd = d3.interpolate(y.domain(), [d.y, 1]),
          yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);

        return function (d, i) {
          if (i) {
            return function(t) { 
              return arc(d); 
            };
          } else {
            return function (t) {
              x.domain(xd(t));
              y.domain(yd(t)).range(yr(t));
              return arc(d);
            }
          }
        }
      }
    }

		function chart (selection) {

      var group_main = selection.append('g').classed('group-main', true);

      renderSunburst(group_main);
		}

		for (var attr in props) {
			if ((!chart[attr]) && (props.hasOwnProperty(attr))) {
				chart[attr] = createAccessor(attr);
			}
		}

		/* start-test-block */
		
		/* end-test-block */

		return chart;
	};
})();
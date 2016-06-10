/* globals _*/
(function() {
    // Optional: if defined, is invoked once at the very beginning of each Moonbeam draw cycle
    // Use this to configure a specific Moonbeam instance before rendering.
    // Arguments: 
    //  - preRenderConfig: the standard callback argument object
    function preRenderCallback(preRenderConfig) {
        preRenderConfig.moonbeamInstance.legend.visible = false;
    }

    function validateDatum (str) {
        var d = new Date(str);

        if ( !isNaN(d.getTime()) ) {
            return str;
        }

        return str.match(/^(\d{2})(\d{2})(\d{4})/).slice(1).join('-');
    }

    function getFixedData (data) {
        return data.map(function (d) {
            return {
                task: d.task,
                subtask: d.subtask,
                start: validateDatum( d.start ),
                end: validateDatum( d.end )
            };
        });
    }

    function getFormatedBuckets ( renderConfig ) {
        if ( !renderConfig.dataBuckets || !renderConfig.dataBuckets.buckets ) {
            return;
        }
        var bkts = renderConfig.dataBuckets.buckets,
            modif_bkts = {};
        for ( var bkt in bkts ) {
            if ( bkts.hasOwnProperty( bkt ) ) {
                modif_bkts[bkt] = Array.isArray( bkts[bkt].title ) ? bkts[bkt].title : [bkts[bkt].title];
            }
        }

        return modif_bkts;
    }

    // Required: Is invoked in the middle of each Moonbeam draw cycle
    // This is where your extension should be rendered
    // Arguments:
    //  - renderConfig: the standard callback argument object, including additional properties width, height, etc
    function renderCallback(renderConfig) {
        var mbInstance = renderConfig.moonbeamInstance;
        var props = renderConfig.properties;

        mbInstance.legend.visible = false;

        props.width = renderConfig.width;
        props.height = renderConfig.height;
        props.measureLabel = mbInstance.measureLabel;
        props.data = getFixedData(renderConfig.data);

        props.buckets = getFormatedBuckets(renderConfig);

        var container = d3.select(renderConfig.container)
            .attr('class', 'com_tdg_timeline');

        // ---------------- INIT YOUR EXTENSION HERE

        var chart = focus_context_timeline(props);

        chart(container);

        chart.onrerender = function () {
            renderConfig.modules.tooltip.updateToolTips();
        };

        // ---------------- END ( INIT YOUR EXTENSION HERE )

        // ---------------- CALL updateToolTips IF YOU USE MOONBEAM TOOLTIP
        renderConfig.modules.tooltip.updateToolTips();
    }

    function noDataRenderCallback(renderConfig) {
        var mbInstance = renderConfig.moonbeamInstance;
        var props = renderConfig.properties;

        mbInstance.legend.visible = false;

        props.width = renderConfig.width;
        props.height = renderConfig.height;
        props.measureLabel = mbInstance.measureLabel;

        props.buckets = getFormatedBuckets(renderConfig);
        
        props.data = [{
            "task": "Task 1",
            "subtask": "Subtask 1",
            "start": 1421395200000,
            "end": 1421827200000
        }, {
            "task": "Task 1",
            "subtask": "Subtask 2",
            "start": 1421913600000,
            "end": 1422000000000
        }, {
            "task": "Task 1",
            "subtask": "Subtask 3",
            "start": 1421913600000,
            "end": 1422432000000
        }, {
            "task": "Task 2",
            "subtask": "Subtask 1",
            "start": 1422345600000,
            "end": 1422518400000
        }, {
            "task": "Task 2",
            "subtask": "Subtask 2",
            "start": 1422432000000,
            "end": 1423036800000
        }, {
            "task": "Task 3",
            "subtask": "Subtask 1",
            "start": 1423123200000,
            "end": 1423468800000
        }, {
            "task": "Task 3",
            "subtask": "Subtask 2",
            "start": 1423578800000,
            "end": 1423123200000
        }, {
            "task": "Task 4",
            "subtask": "Subtask 1",
            "start": 1423036800000,
            "end": 1423209600000
        }, {
            "task": "Task 4",
            "subtask": "Subtask 2",
            "start": 1423296000000,
            "end": 1423555200000
        }, {
            "task": "Task 4",
            "subtask": "Subtask 5",
            "start": 1423987200000,
            "end": 1424160000000
        }]; // <------------------------ YOUR DATA

        var container = d3.select(renderConfig.container)
            .attr('class', 'com_tdg_timeline');

        // ---------------- INIT YOUR EXTENSION HERE

        var chart = focus_context_timeline(props);

        chart(container);

        // ---------------- END ( INIT YOUR EXTENSION HERE )

        // ---------------- CALL updateToolTips IF YOU USE MOONBEAM TOOLTIP
        renderConfig.modules.tooltip.updateToolTips();

        // ADD TRANSPARENT SCREEN

        container.append("rect")
            .attr({
                width: props.width,
                height: props.height
            })
            .style({
                fill: 'white',
                opacity: 0.9
            });

        // ADD NO DATA TEXT

        container.append('text')
            .text('Add more measures or dimensions')
            .attr({
                'text-anchor': 'middle',
                y: props.height / 2,
                x: props.width / 2
            })
            .style({
                'font-weight': 'bold',
                'font-size': '14',
                dy: '0.35em',
                fill: 'grey'
            });

    }

    // Your extension's configuration
    var config = {
        id: 'com.ibi.timeline', // string that uniquely identifies this extension
        preRenderCallback: preRenderCallback, // reference to a function that is called right *before* your extension is rendered.  Will be passed one 'preRenderConfig' object, defined below.  Use this to configure a Monbeam instance as needed
        renderCallback: renderCallback, // reference to a function that will draw the actual chart.  Will be passed one 'renderConfig' object, defined below
        noDataRenderCallback: noDataRenderCallback,
        resources: { // Additional external resources (CSS & JS) required by this extension
            script: ['lib/d3.min.js', 'lib/focus_context_timeline.js'],
            css: ['css/main.css']
        },
        modules: {
            /*dataSelection: {
            	supported: true,  // Set this true if your extension wants to enable data selection
            	needSVGEventPanel: false, // if you're using an HTML container or altering the SVG container, set this to true and Moonbeam will insert the necessary SVG elements to capture user interactions
            	svgNode: function(arg){}  // if you're using an HTML container or altering the SVG container, return a reference to your root SVG node here.
            },*/
            tooltip: {
                supported: true // Set this true if your extension wants to enable HTML tooltips
            }
        }
    };

    // Required: this call will register your extension with Moonbeam
    tdgchart.extensionManager.register(config);

}());

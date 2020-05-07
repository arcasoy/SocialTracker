const plot = require('./plot_modules');

module.exports = {
    change: async function change(data, callback) {
        var x = data.map(a => ([...a])),
            y = data.map(a => ([...a]));

        //getting x data
        for (var array of x) {
            array.splice(1, 3);
        };
        x = x.flat();
        xLabel = x.shift();

        //getting y series
        for (var array of y) {
            array.splice(0, 3);
        };
        y = y.flat();
        yLabel = y.shift();

        //graphing to plotly
        var graphData = [
            {
                x: x,
                y: y,
                type: "bar",
                marker: {
                    color: "#7C68FF"
                }
            }
        ];

        //plot layout and options
        var layout = require('../plotSettings/followerChange.json');
        //insert part where title is changed based on socal media used here
        var graphOptions = {layout: layout, filename: "Follower Change", fileopt: "overwrite"};

        plot.createPlot(graphData, graphOptions, function(path) {
            callback(path);
        })
    },
    overall: async function overall(data, callback) {
        var x = data.map(a => ([...a])),
            y = data.map(a => ([...a]));

        //getting x data
        for (var array of x) {
            array.splice(1, 3);
        };
        x = x.flat();
        xLabel = x.shift();

        //getting y series
        for (var array of y) {
            array.splice(0, 2);
            array.splice(1, 1);
        };
        y = y.flat();
        yLabel = y.shift();

        //graphing to plotly
        var graphData = [
            {
                x: x,
                y: y,
                type: "line",
                fill: "tozeroy",
                marker: {
                    color: "#7C68FF"
                }
            }
        ];

        //plot layout and options
        var layout = require('../plotSettings/overallFollowers.json');
        //insert part where title is changed based on socal media used here
        var graphOptions = {layout: layout, filename: "Follower Change", fileopt: "overwrite"};

        plot.createPlot(graphData, graphOptions, function(path) {
            callback(path);
        })
    }    
}

/* ToDo:
- Add calls for different chart types that are stored in a folder somewhere
*/
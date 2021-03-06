const img = require('./img_module.js');
const auth = require('../auth/auth.json');

//plotly login
const plotlyLogin = {username: auth.plotlyUsername, apiKey: auth.plotlyToken, host:'chart-studio.plotly.com'};
const plotly = require('plotly')(plotlyLogin);

module.exports = {
    change: async function change(data, social, callback) {     
        var x = data.map(a => ([a.dt].toString().slice(4, 15))).flat(),
            y = []
        y.push(0);
        for (element in data) {
            if (element === 0) y.push(element);
            else if (element > 0) y.push(data[element].followers - data[element-1].followers)
        }
        //getting social settings
        let socialSet = require('../plotSettings/socialSettings.json');
        //graphing to plotly
        var graphData = [
            {
                x: x,
                y: y,
                type: "bar",
                marker: {
                    color: socialSet[social].markerColor
                }
            }
        ];

        //plot layout and options
        var layout = require('../plotSettings/followerChange.json');
        //insert part where title is changed based on socal media used here
        var graphOptions = {layout: layout, filename: "Follower Change", fileopt: "overwrite"};

        createPlot(graphData, graphOptions, function(path) {
            callback(path);
        })
    },
    overall: async function overall(data, social, callback) {
        var x = data.map(a => ([a.dt].toString().slice(4, 15))).flat(),
            y = data.map(a => ([a.followers])).flat();
        //getting social settings
        let socialSet = require('../plotSettings/socialSettings.json');
            //graphing to plotly
        var graphData = [
            {
                x: x,
                y: y,
                type: "line",
                fill: "tozeroy",
                marker: {
                    color: socialSet[social].markerColor
                },
                fillcolor: socialSet[social].fillColor
            }
        ];

        //plot layout and options
        var layout = require('../plotSettings/overallFollowers.json');
        layout.yaxis.range[0] = Math.min(...y)
        layout.yaxis.range[1] = Math.max(...y)
        if (layout.yaxis.range[0] + 10 > layout.yaxis.range[1]) {
            layout.yaxis.range[1] = layout.yaxis.range[0] + 10;
        }
        //insert part where title is changed based on socal media used here
        var graphOptions = {layout: layout, filename: "Follower Overall", fileopt: "overwrite"};
        

        createPlot(graphData, graphOptions, function(path) {
            callback(path);
        })
    }    
}

//Not included in module.exports
async function createPlot(graphData, graphOptions, callback) {
    var filePath = './temp.png'; 
    plotly.plot(graphData, graphOptions, function (err, msg) {
        if (err)
            return console.log(err);
        
        // Figure target info for getFigure
        var target = msg.url.split("/").splice(3);
        target[0] = target[0].slice(1);

        //get image from plotly
        plotly.getFigure(target[0], parseInt(target[1]), function (err, figure) {
            if (err)
                return console.log(err);

            var imgOpts = {
                format: 'png',
                width: 1000,
                height: 500
            };
            //get and save image
            plotly.getImage(figure, imgOpts, function (error, imageStream) {
                if (error)
                    return console.log(error);
                img.createFile(filePath, imageStream, function(path) {
                    callback(path);
                });
            });
        });
    })
}

/* ToDo:
- Add calls for different chart types that are stored in a folder somewhere
- Change plot is shifted by a day. Change should be on the day the change occurred, not the day after
*/
const img = require('./img_module.js');
const auth = require('../auth/auth.json');

const plotlyLogin = {username: auth.plotlyUsername, apiKey: auth.plotlyToken, host:'chart-studio.plotly.com'};
const plotly = require('plotly')(plotlyLogin);

module.exports = {
    createPlot: async function createPlot(graphData, graphOptions, callback) {
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
}
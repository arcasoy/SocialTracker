const Discord = require('discord.js');
const auth = require('./auth/auth.json');
const client = new Discord.Client();
const fs = require('fs');

//google sheets stuff
const { GoogleSpreadsheet } = require('google-spreadsheet');

//plotting stuff
var plotlyLogin = {username:"arcasoy", apiKey:auth.plotlyToken, host:'chart-studio.plotly.com'};
var plotly = require('plotly')(plotlyLogin);

client.on('ready', () => {
    client.user.setPresence({ activity: { type: 'WATCHING', name: 'your Followers!' }, status: 'online' })
        //.then(console.log) //For ClientPresence log
        .catch(console.error);   
    console.log(`Logged in as ${client.user.tag}!`);
});

//Respond to general messages
client.on('message', msg => {
    //@SocialTracker for bot information
    if (msg.mentions.users.first() === client.user) {
        msg.reply(`Hi ${msg.author.username} I'm SocialTracker, the Discord Bot developed to help you grow your socials!\nCheck out my source code and plans here: https://github.com/arcasoy/SocialTracker.\nFeel free to contact <@166055639322329088> if you'd like to help make me better!`);
    }   
});

//Respond to messages sent by AX
client.on('message', msg => {
    client.users.fetch('166055639322329088').then(result => {
        console.log("AX has sent a message! Must respond!");
        if (result === msg.author && msg.content === "analyze") {
            sheetsData(function(dataObject) {
                console.log(dataObject);
            })}
        else if (result === msg.author && msg.content === "raw data") {
            sheetsData(function(dataObject) {
                msg.reply(dataObject);
            });
        }
        else if (result === msg.author && msg.content === "scatter") {
            console.log("In-Development");
            sheetsData(function(dataObject) {
                scatter();//dataObject, function(image) {
                    //send image to channel once created
                    //msg.reply({files: [image]});
                    //console.log("out in the world");
                });
            };
        });
    });

async function sheetsData(callback) {
    // spreadsheet key is the long id in the sheets URL
    const doc = new GoogleSpreadsheet('1A6YStCvNOclr2CPOUjHSBMuEpAmjRys7eqOLJ3qUdC4');

    // OR load directly from json file if not in secure environment
    await doc.useServiceAccountAuth(require('./auth/tds-insta-268305-9dc6f93f5006.json'));

    await doc.loadInfo(); // loads document properties and worksheets
    const sheetInsta = doc.sheetsByIndex[0]; // set instagram sheet
    await sheetInsta.loadCells(); // load all cells on instagram sheet
    
    //determining row count
    const filledCells = sheetInsta.cellStats.nonEmpty;
    var columns = 4; //populated columns, figure out a way to dynamically get this
    var rows = filledCells/columns;

    let data = [];
    let rowArr = [];

    for (var i = 0; i < rows; i++) {
        if (rowArr.length === 4) {
            data.push(rowArr);
            rowArr = [];
        }
        for (var j = 0; j < columns; j++) {
            rowArr.push(sheetInsta.getCell(i, j).formattedValue);
        }
    }
    callback(data);
}

function scatter() {    
    plotly.getFigure('arcasoy', 4, function (err, figure) {
        if (err) return console.log(err);
        console.log(figure);
        var imgOpts = {
            format: 'png',
            width: 1000,
            height: 500
        };
        //need to fix from here down, error 502
        plotly.getImage(figure, imgOpts, function (error, imageStream) {
            if (error) return console.log (error);
            console.log("in get image");
            var fileStream = fs.createWriteStream('./2.png');
            imageStream.pipe(fileStream);
        });
    });
    //callback(scatterPlot);
};

client.login(auth.discordToken);

/* ToDo:
- google sheets incorporation
*/
const Discord = require('discord.js');
const auth = require('./auth/auth.json');
const client = new Discord.Client();
const img = require('./modules/img_module.js');
const plot = require('./modules/plot_type_modules.js');

//google sheets stuff
const { GoogleSpreadsheet } = require('google-spreadsheet');

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
        if (result !== msg.author ) {
            return;
        }
        else {
            console.log("AX has sent a message! Must respond!");
            if (result === msg.author && msg.content === "raw data") {
                sheetsData(function(dataArray) {
                    msg.reply(dataArray)
                        .catch(console.error);
                });
            }
            else if (result === msg.author && msg.content === "Change") {
                sheetsData(function(dataArray) {
                    plot.change(dataArray, function(path) {
                        msg.reply({files: [path]})
                            .then(() => img.clearFile(path))
                            .catch(console.error);
                    });
                });
            }
            else if (result === msg.author && msg.content === "Overall") {
                sheetsData(function(dataArray) {
                    plot.overall(dataArray, function(path) {
                        msg.reply({files: [path]})
                            .then(() => img.clearFile(path))
                            .catch(console.error);
                    });
                });
            };
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
    var filledCells = sheetInsta.cellStats.nonEmpty;
    var columns = 4; //populated columns, figure out a way to dynamically get this
    var rows = Math.ceil(filledCells/columns);

    var data = [];
    var rowArr = [];

    for (var i = 0; i < (rows+1); i++) {
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

client.login(auth.discordToken);

/* ToDo:
- clean up plotting modules and settings
- move g-sheet login to another file
- expand to more plot options (total growth, projected growth (premium), trendlines(premium), etc)
- integrate plotting for other socials (youtube, twitch, twitter)
- database integration (move away from g-sheets)
- add instagram tracking to this bot rather than the other one we are using
- use discord.js guilds to allow more servers to use! 
*/
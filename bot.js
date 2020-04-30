const Discord = require('discord.js');
const auth = require('./auth/auth.json');
const client = new Discord.Client();

//google sheets stuff
const { GoogleSpreadsheet } = require('google-spreadsheet');
//const Plotly = require('plotly.js-dist');
const isGSheet = true;

client.on('ready', () => {
    client.user.setPresence({ activity: { type: 'WATCHING', name: 'your Followers!' }, status: 'online' })
        //.then(console.log) //For ClientPresence log
        .catch(console.error);   
    console.log(`Logged in as ${client.user.tag}!`);
});

//Respond to messages in a server
client.on('message', msg => {
    //@SoulCatcher for bot information
    if (msg.mentions.users.first() === client.user) {
        msg.reply(`Hi ${msg.author.username} I'm SocialTracker, the Discord Bot developed to help you grow your socials!\nCheck out my source code and plans here: https://github.com/arcasoy/SocialTracker.\nFeel free to contact <@166055639322329088> if you'd like to help make me better!`);
    }   
});

//collect data
client.on('message', msg => {
    if (msg.content === "analyze") {
        sheetsData(function(dataObject) {
            //expand this to all indicies
            var dataArray = dataObject.formattedValue;
            console.log(dataObject[1][1].formattedValue);
        });
    }
});

async function sheetsData(callback) {
    // spreadsheet key is the long id in the sheets URL
    const doc = new GoogleSpreadsheet('1A6YStCvNOclr2CPOUjHSBMuEpAmjRys7eqOLJ3qUdC4');

    // OR load directly from json file if not in secure environment
    await doc.useServiceAccountAuth(require('./auth/tds-insta-268305-9dc6f93f5006.json'));

    await doc.loadInfo(); // loads document properties and worksheets
    const sheetInsta = doc.sheetsByIndex[0]; // set instagram sheet
    await sheetInsta.loadCells(); // load all cells on instagram sheet
    
    //make this more dynamic so it adjusts to the sheet
    var i = 54,
        j = 4,
        data = [];

    for (i = 0; i < 54; i++) {
        data[i] = sheetInsta.getCell(i, j);
        for (j = 0; j < 4; j++) {
            data[i][j] = sheetInsta.getCell(i, j);
        }
    }

    //console.log(data);

    callback(data);
}

client.login(auth.token);

/* ToDo:
- google sheets incorporation
*/
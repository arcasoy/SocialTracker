const Discord = require('discord.js');
const auth = require('./auth/auth.json');
const client = new Discord.Client();
const img = require('./modules/img_module.js');
const plot = require('./modules/plot_modules.js');
const db = require('./modules/db_modules.js');
const yt = require('./modules/yt_modules');

//google storage stuff
const { GoogleSpreadsheet } = require('google-spreadsheet');

//Discord Message Embed
const EmbedMsg = new Discord.MessageEmbed()
	.setColor('#ffd801')
	.setTitle('Sample Title')
	.setAuthor('Social Tracker Bot', 'https://i.imgur.com/ev3XYNc.png', 'https://discord.com/api/oauth2/authorize?client_id=699829462614671390&permissions=8&scope=bot')
	.setDescription('⬆️ Is this the right account? ⬆️')
	.setThumbnail('https://i.imgur.com/ev3XYNc.png')
	.setTimestamp()
	.setFooter('Social Tracker Developed by AX#1999', 'https://i.imgur.com/ev3XYNc.png');

//channel.send(exampleEmbed);

//Connect to Discord and set status
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

//Respond to messages sent with prefix !st
client.on('message', msg => {
    if (msg.content.split(" ")[0] === '.st') {
        console.log("Command Recieved using prefix .st");
        let commandContent = msg.content.split(" "); //Creating variable for all command details
        
        //The following are commands that can be called
        if (commandContent[1] === "rawdata") {
            sheetsData(dataArray => {
                msg.reply(dataArray)
                    .catch(console.error);
            });
        }
        //initializing new social media
        else if(commandContent[1] === "new") {
            let acceptedResponses = ['instagram', 'youtube'];
            if (acceptedResponses[0] === commandContent[2]) {
                msg.reply("instagram tracking in development still");
            } else if (acceptedResponses[1] === commandContent[2]) {
                if (commandContent[3]) {
                    yt.newAccount(commandContent[3], result => {
                        console.log(result.snippet);
                        msg.channel.send(EmbedMsg.setTitle(result.snippet.title).setThumbnail(result.snippet.thumbnails.default.url).setURL(`https://www.youtube.com/channel/${result.id}`))
                            .then(sentEmbed => {
                                sentEmbed.react("✅")
                                sentEmbed.react("❌")
                            });
                    })
                    //db.insert(msg.guild.id, commandContent[2], commandContent[3])
                } else {
                    msg.reply('you must include a channel id!');
                }
            } else {
                msg.reply(`that is not an accepted response. Accepted responses: \n ${acceptedResponses[0]} \n ${acceptedResponses[1]}`);
            }
        }
        //temporary to ensure that no TDS data is populated in other server's databases
        else if (commandContent[1] === "transfer") {
            sheetsData(dataArray => {
                if (msg.guild.id === '679535001288966156') {
                    db.insert(msg.guild.id, "instagram", dataArray);
                    msg.reply("Data from Google Sheets has been updated to Google Cloud MySQL Database")
                } else {
                    msg.reply("You are not in the right server ALEX!")
                }
            });
        }
        else if (commandContent[1] === "change") {
            db.query('679535001288966156', "insta", result => {
                plot.change(result, path => {
                    msg.reply({files: [path]})
                        .then(() => img.clearFile(path))
                        .catch(console.error);
                });
            });
        }
        else if (commandContent[1] === "overall") {
            db.query('679535001288966156', "insta", result => {
                plot.overall(result, path => {
                    msg.reply({files: [path]})
                        .then(() => img.clearFile(path))
                        .catch(console.error);
                });
            });
        }
        else if (commandContent[1] === "query") {
            db.query(msg.guild.id, "insta", result => {
                console.log('recieved result');
            })
        } 
        else if (commandContent[1] === 'premium') {
            msg.reply("Thank you for inquiring about Social Tracker Premium! Premium features will be available shortly once my primary functions are solidified!");
        }
        else {
            msg.reply(`${commandContent[1]} is not a command!`);
        }
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
- Get ONE (any) social media tracking from this bot (can move to another bot down the line if demand is so high).
- settings table in database for social id storage
- move g-sheet login to another file
- expand to more plot options (projected growth (premium), trendlines(premium), etc)
- integrate plotting for other socials (youtube, twitch, twitter)
- add instagram tracking to this bot rather than the other one we are using
- use discord.js guilds to allow more servers to use! 
- (add functionality to add multiple accounts/premium feature)
*/
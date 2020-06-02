const Discord = require('discord.js');
const auth = require('./auth/auth.json');
const { clone, cloneDeep } = require('lodash');
const client = new Discord.Client();
const img = require('./modules/img_module.js');
const plot = require('./modules/plot_modules.js');
const db = require('./modules/db_modules.js');
const yt = require('./modules/yt_modules.js');
const disc = require('./modules/disc_modules.js');
const track = require('./modules/track_modules.js');

//google storage stuff
const { GoogleSpreadsheet } = require('google-spreadsheet');



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
        
        //initializing new social media
        if(commandContent[1] === "new") {
            let acceptedResponses = ['instagram', 'youtube'];
            if (commandContent[2] === acceptedResponses[0]) {
                msg.reply("instagram tracking in development still");
            } else if (commandContent[2] === acceptedResponses[1]) {
                if (commandContent[3]) {
                    yt.newAccount(commandContent[3], result => {
                        let newEmbed = cloneDeep(disc.EmbedMsg);
                        msg.channel.send(newEmbed.setTitle(result.snippet.title).setThumbnail(result.snippet.thumbnails.high.url).setDescription('⬆️ Is this the right account? ⬆️').setURL(`https://www.youtube.com/channel/${result.id}`))
                        .then(sentEmbed => {
                            disc.YNReaction(msg, sentEmbed, response => {
                                if (response) {
                                    db.newAccount(msg.guild.id, commandContent[2], commandContent[3], () => {
                                        let newEmbed = cloneDeep(disc.EmbedMsg);
                                        msg.channel.send(newEmbed.setTitle("Account Added").setDescription("Your account will begin to be tracked daily!"));
                                        track.ytTrack();
                                    })
                                }
                                else {
                                    let newEmbed = cloneDeep(disc.EmbedMsg);
                                    msg.channel.send(newEmbed.setTitle("Account Not Added").setDescription("Re-enter command to choose another account"));
                                }
                            })
                        })
                    })
                } else msg.reply('you must include a channel id!');
            } else msg.reply(`that is not an accepted response. Accepted responses: \n ${acceptedResponses[0]} \n ${acceptedResponses[1]}`);
        }
        //temporary to ensure that no TDS data is populated in other server's databases
        else if (commandContent[1] === "transfer") {
            sheetsData(dataArray => {
                if (msg.guild.id === '679535001288966156') {
                    db.transferInsert(msg.guild.id, "instagram", dataArray);
                    msg.reply("Data from Google Sheets has been updated to Google Cloud MySQL Database")
                } else {
                    msg.reply("You are not in the right server ALEX!")
                }
            });
        }
        else if (commandContent[1] === "change") {
            db.query(msg.guild.id, commandContent[2], result => {
                if (result === 'ER_BAD_DB_ERROR') {
                    let newEmbed = cloneDeep(disc.EmbedMsg);
                    msg.channel.send(newEmbed.setTitle("Uh-oh").setDescription(`No accounts tracked!`).addField("Next Steps:", `Use ".st new {social} {username}" to start tracking an account!`));
                }
                else if (result === 'ER_NO_SUCH_TABLE') {
                    let newEmbed = cloneDeep(disc.EmbedMsg);
                    msg.channel.send(newEmbed.setTitle("Uh-oh").setDescription(`No data for your ${commandContent[2]} account found`).addField("Next Steps:", `Use ".st new ${commandContent[2]} {username}" to start tracking!`));
                }
                else if (result !== undefined && result.length > 1) {
                    plot.change(result, path => {
                        msg.reply({files: [path]})
                            .then(() => img.clearFile(path))
                            .catch(console.error);
                    });
                } else if (result !== undefined && result.length === 1) {
                    let newEmbed = cloneDeep(disc.EmbedMsg);
                    msg.channel.send(newEmbed.setTitle("Uh-oh").setDescription(`Not enough data for your ${commandContent[2]} account`).addField("Please wait 2 days:", `We check your growth daily! To plot it, we need at least 2 data points!`));
                }
            });
        }
        else if (commandContent[1] === "overall") {
            db.query(msg.guild.id, commandContent[2], result => {
                if (result === 'ER_BAD_DB_ERROR') {
                    let newEmbed = cloneDeep(disc.EmbedMsg);
                    msg.channel.send(newEmbed.setTitle("Uh-oh").setDescription(`No accounts tracked!`).addField("Next Steps:", `Use ".st new {social} {username}" to start tracking an account!`));
                }
                else if (result === 'ER_NO_SUCH_TABLE') {
                    let newEmbed = cloneDeep(disc.EmbedMsg);
                    msg.channel.send(newEmbed.setTitle("Uh-oh").setDescription(`No data for your ${commandContent[2]} account found`).addField("Next Steps:", `Use ".st new ${commandContent[2]} {username}" to start tracking!`));
                }
                else if (result !== undefined && result.length > 1) {
                    plot.overall(result, path => {
                        msg.reply({files: [path]})
                            .then(() => img.clearFile(path))
                            .catch(console.error);
                    });
                } else if (result !== undefined && result.length === 1) {
                    let newEmbed = cloneDeep(disc.EmbedMsg);
                    msg.channel.send(newEmbed.setTitle("Uh-oh").setDescription(`Not enough data for your ${commandContent[2]} account`).addField("Please wait 2 days:", `We check your growth daily! To plot it, we need at least 2 data points!`));
                }
            });
        }
        else if (commandContent[1] === 'feedback') {
            var feedbackString = commandContent.splice(2).join().replace(/,/g, " ")
            db.feedback(msg.guild.id, commandContent[1], feedbackString, msg.author.username);
            let newEmbed = cloneDeep(disc.EmbedMsg);
            msg.channel.send(newEmbed.setTitle("Feedback Recorded").setDescription("Thank you for contributing your thoughts!\nWe value your feedback!").addField("Your Feedback:", `${feedbackString}`));
        } 
        else if (commandContent[1] === 'premium') {
            msg.reply("Thank you for inquiring about Social Tracker Premium! Premium features will be available shortly once my primary functions are solidified!");
        }
        else if (commandContent[1] === 'help') {
            let newEmbed = cloneDeep(disc.EmbedMsg);
            msg.channel.send(newEmbed
                                .setTitle("Help:")
                                .setDescription("Help menu is currently in development.")
                                .addField("Help US Help YOU!", 'Please use ".st feedback {message}" or contact @AX#1999 with your questions!')
                                .addFields(
                                    { name: ".st new {social} {id}", value: "Start tracking a new social", inline: true },
                                    { name: ".st change {social}", value: "Daily Change of your social", inline: true },
                                    { name: ".st overall {social}", value: "Overall Growth of your social", inline: true },
                                    { name: ".st feedback {message}", value: "Give us feedback!", inline: true },
                                )
                            );
        }
        else {
            let newEmbed = cloneDeep(disc.EmbedMsg);
            msg.channel.send(newEmbed.setTitle("Uh-oh").setDescription("That command does not exist").addField('Need help?', 'Please type ".st help" for a list of commands'));
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
    var columns = 3; //populated columns, figure out a way to dynamically get this
    var rows = Math.ceil(filledCells/columns);

    var data = [];
    var rowArr = [];

    for (var i = 0; i < (rows+1); i++) {
        if (rowArr.length === 3) {
            data.push(rowArr);
            rowArr = [];
        }
        for (var j = 0; j < columns; j++) {
            rowArr.push(sheetInsta.getCell(i, j).formattedValue);
        }
    }
    data.shift();
    callback(data);
}

client.login(auth.discordToken);

/* ToDo:
- Auto tracking daily (midnight)
- Clean up function. Make better exports, modules, promises (PLEASE PROMISES OMG CALLBACK HELL) Look into classes using this.command stuff.
- move g-sheet login to another file
- expand to more plot options (projected growth (premium), trendlines(premium), etc)
- integrate plotting for other socials (instagram, youtube, twitch, twitter)
- add instagram tracking to this bot rather than the other one we are using
- use discord.js guilds to allow more servers to use! 
- (add functionality to add multiple accounts/premium feature)
*/
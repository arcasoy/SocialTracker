const Discord = require('discord.js');
const auth = require('./auth.json');
const client = new Discord.Client();

var botID;

client.on('ready', () => {
    client.user.setPresence({ activity: { type: 'WATCHING', name: 'your Followers!' }, status: 'online' })
        //.then(console.log) //For ClientPresence log
        .catch(console.error);   
    console.log(`Logged in as ${client.user.tag}!`);
    
    //Collect Bot ID
    botID = client.user.id;
    //console.log(botID);
});

client.on('message', msg => {
    //ping pong
    if (msg.content === 'ping') {
        msg.reply('pong');
    }
    //capitalized Ping Pong
    else if (msg.content === 'Ping') {
        msg.reply('Pong');
        console.log(`<@${botID}>`);
    }
    //@SoulCatcher for bot information
    else if (msg.mentions.users) {
        let firstMention = msg.mentions.users.first();
        if (firstMention === client.user) {
            msg.reply(`Hi ${msg.author.username} I'm Soul Catcher, the Discord Bot developed for Team Damaged Souls!\nCheck out my source code here: https://github.com/TeamDamagedSouls/TDS-Discord-Bot.\nFeel free to contact <@166055639322329088> if you'd like to help make me better!`)
        }
    }   
});

client.login(auth.token);

/* ToDo:
- Ping pong cooldown
- response when someone says pong ("I don't understand, may I suggest: "ping"")
*/
const Discord = require('discord.js');

module.exports = {
    EmbedMsg: new Discord.MessageEmbed() 
        .setColor('#ffd801')
	    .setTitle('Empty Embed')
        .setAuthor('Social Tracker Bot', 'https://i.imgur.com/ev3XYNc.png', 'https://discord.com/api/oauth2/authorize?client_id=699829462614671390&permissions=8&scope=bot')
        .setThumbnail('https://i.imgur.com/ev3XYNc.png')
        .setTimestamp()
	    .setFooter('Social Tracker Developed by AX#1999', 'https://imgur.com/1F7bu1C.png'),

    YNReaction: async function YNReaction(userMsg, sentMsg, callback) {
        await sentMsg.react("✅")
        await sentMsg.react("❌")
        let filter = (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === userMsg.author.id
        sentMsg.awaitReactions(filter, {max: 1})
        .then(collected => {
            switch(collected.first().emoji.name) {
                case '✅':
                    callback(true);
                    break;
                case '❌':
                    callback(false);
                    break;
            }
        })
    }
}


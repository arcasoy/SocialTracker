authFile = require('../auth/auth.json');
const {google} = require('googleapis');
const youtube = google.youtube({
    version: 'v3',   
    auth: authFile.youtubeAPIKey
})

module.exports = {
    newAccount: async function newAccount(ChannelID, callback) {
        const res = await youtube.channels.list({part: 'snippet', id: ChannelID}); //need to develop error handling when improper ID is input
        callback(res.data.items[0]);
    },
    getData: async function getData(ChannelID) {
        const res = await youtube.channels.list({
            part: 'statistics', 
            id: ChannelID
        });
        return(res.data.items[0].statistics.subscriberCount);
    }
}

/*
ToDo:
- Get vanity url (youtube.com/user/FaZeClan) to work
*/
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
            id: 'UCckRclZM-Lgeyy3f3SKsGPg'
        });
        console.log(res.data);
        console.log(res.data.items[0].statistics);
    }
}
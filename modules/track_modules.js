const db = require('./db_modules.js');
const yt = require('./yt_modules.js');

let ytTrack = async function () {
    db.getYT(results => {
        for (result of results) {
            //console.log(result);
            db.insert(result.database, 'youtube', result.subs.toString())
        }
    })
}

let twitchTrack = async function () {

}

module.exports.ytTrack = ytTrack;
module.exports.twitchTrack = twitchTrack;


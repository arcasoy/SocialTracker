const db = require('./db_modules.js');
const yt = require('./yt_modules.js');

let ytTrack = async function () {
    db.getYT(results => {
        for (result of results) {
            db.insert(result.database, 'youtube', result.subs.toString())
        }
    })
}

module.exports.ytTrack = ytTrack;


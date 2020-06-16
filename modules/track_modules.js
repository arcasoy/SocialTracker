const db = require('./db_modules.js');
const yt = require('./yt_modules.js');
const twitch = require('./twitch_modules.js')

let track = async function (social) {
    return promise = new Promise(function (resolve, reject) {
        db.getAccounts(social, async function (results) {
            let data = await results.map(async (result) => { // map instead of forEach
                if (!social) {
                    console.log('No social selected');
                } else if (social === 'youtube') {
                    const followers = await yt.getData(result.user);
                    return {"database": result.database, "user": result.user, "followers": followers}
                } else if (social === 'twitch') {
                    const followers = await twitch.getData(result.user)
                    return {"database": result.database, "user": result.user, "followers": followers.total}
                }
            });
            await Promise.all(data)
            .then(resolvedResults => {
                for (resolvedResult of resolvedResults) {
                    //console.log(resolvedResult)
                    db.insert(resolvedResult.database, social, resolvedResult.followers.toString()) //This isn't the only thing hanging. Might still be hanging tho
                }  
            })
            .then(resolve("done"))
            .catch(reject(new Error("error")))
        })
    })



    // db.getAccounts(social, async function (results) {
    //     let data = await results.map(async (result) => { // map instead of forEach
    //         if (!social) {
    //             console.log('No social selected');
    //         } else if (social === 'youtube') {
    //             const followers = await yt.getData(result.user);
    //             return {"database": result.database, "user": result.user, "followers": followers}
    //         } else if (social === 'twitch') {
    //             const followers = await twitch.getData(result.user)
    //             return {"database": result.database, "user": result.user, "followers": followers.total}
    //         }
    //     });
    //     let resolvedResults = await Promise.all(data);
    //     for (resolvedResult of resolvedResults) {
    //         db.insert(resolvedResult.database, social, resolvedResult.followers.toString())
    //     }   
    // })
}

module.exports.track = track;


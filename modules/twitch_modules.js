const auth = require('../auth/auth.json');
const fetch = require('node-fetch');
const fs = require('fs');

let authenticate = new Promise(async (resolve, reject) => {
    var authFile = await JSON.parse(fs.readFileSync('auth/auth.json'))
    await fetch(`https://id.twitch.tv/oauth2/validate`, {headers: {'Authorization': `OAuth ${authFile.twitchCreds.access_token}`}})
    .then(async result => {
        if (result.status === 200) {
            resolve(authFile.twitchCreds.access_token)
        } else if (result.status !== 200) {
            await fetch(`https://id.twitch.tv/oauth2/token?client_id=${auth.twitchCreds.client_id}&client_secret=${auth.twitchCreds.client_secret}&grant_type=client_credentials`, {
                method: 'POST'
            })
            .then(async result => {
                let resJSON = await result.json()
                authFile.twitchCreds.access_token = await resJSON.access_token;
                fs.writeFileSync('../auth/auth.json', JSON.stringify(authFile))
                resolve(authFile.twitchCreds.access_token)
            })
            .catch(reject(new Error('Updating Acces Token Fetch Failed')))
        }
    })
    .catch(async err => reject(new Error("Access Token Validation Failed", err)))
})

module.exports = {
    userName2ID: async function userName2ID(userName, callback) {
        authenticate
        .then(async result => {
            await fetch(`https://api.twitch.tv/helix/users?login=${userName}`, {method: 'GET', headers: {'Client-ID': `${auth.twitchCreds.client_id}`,'Authorization': `Bearer ${await result}`}})
            .then(async result => {
                let res = await result.json()
                callback(res.data[0])
            })
        })
    },
    getData: async function getData(userID, callback) {
        return authenticate
        .then(async result => {
            const res = await fetch(`https://api.twitch.tv/helix/users/follows?to_id=${userID}`, {method: 'GET', headers: {'Client-ID': `${auth.twitchCreds.client_id}`,'Authorization': `Bearer ${await result}`}})
            // .then(async result => {
            //     let res = await result.json()
            //     return(await res.total)
            // })
            return(await res.json())
        })
    }
}
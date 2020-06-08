const track = require('./modules/track_modules')

track.track('youtube')
.then(track.track('twitch'))
.catch(err => console.log(err))
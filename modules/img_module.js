const fs = require('fs');

module.exports = {
    createFile: async function createFile(path, imageStream, callback) {
        //creates file stream, then returns path the stream was opened at
        var fileStream = fs.createWriteStream(path);
        var stream = imageStream.pipe(fileStream);
        stream.on('finish', function() {
            callback(imageStream.pipe(fileStream).path);
        });
    },
    
    clearFile: async function clearFile(path) {
        //deletes file at path
        fs.unlink(path, (err) => {
            if (err) {
                console.log(err);
                return;
            };
        })
    }
}
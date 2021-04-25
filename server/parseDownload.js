const AdmZip = require('adm-zip');
const fs = require('fs');
const download = "./download.zip";
const file = new AdmZip("./download.zip");
try {
    if (fs.existsSync('./song.ogg')) {
        fs.unlinkSync('./song.ogg');
    }
    file.extractEntryTo('song.egg', './', function(err) {
        if (err) console.log("Error: "+err);
    });
    fs.rename('./song.egg', './song.ogg', function(err) {
        if (err) console.log('ERROR: ' + err);
    });
}
catch {
    console.error(err);
}
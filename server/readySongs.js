const fs = require("fs");
const AdmZip = require("adm-zip");

const dir = fs.opendirSync("./songs/zipped");
let dirent;
let x = 0;
let gl = {};
while ((dirent = dir.readSync()) !== null) {
    if (x++ > 10) break;
    if (dirent.name.endsWith(".zip")) {
        let zip = new AdmZip("./songs/zipped/" + dirent.name);
        let hash = dirent.name.replace(".zip", "");
        let info = zip.readAsText("info.dat");
        info = JSON.parse(info);
        gl[hash] = info;
        zip.extractAllTo("./songs/unzipped/" + hash);
    }
    console.log(dirent.name);
}
fs.writeFileSync("./db.json", JSON.stringify(gl));
dir.closeSync();

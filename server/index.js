const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const fetch = require("node-fetch");
const fileUpload = require("express-fileupload");

const PORT = 9635;

app.use(
    fileUpload({
        limits: { fileSize: 50 * 1024 * 1024 },
    }),
);
app.use(express.static(__dirname + "/build"));

app.post("/upload", function (req, res) {
    let sampleFile;
    let uploadPath;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send("No files were uploaded.");
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    sampleFile = req.files.sampleFile;
    uploadPath = __dirname + "/songs/" + sampleFile.name;

    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv(uploadPath, function (err) {
        if (err) return res.status(500).send(err);

        res.send("File uploaded!");
    });
});

server.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});

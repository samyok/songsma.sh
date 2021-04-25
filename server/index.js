const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

const fetch = require("node-fetch");
const fileUpload = require("express-fileupload");
const db = require("./db.json");
const fs = require("fs");
const path = require("path");
const PORT = 9635;

app.use(
    fileUpload({
        limits: { fileSize: 50 * 1024 * 1024 },
    }),
);
function shuffle(array) {
    var currentIndex = array.length,
        temporaryValue,
        randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

app.get("/search", (req, res) => {
    let results = shuffle(Object.keys(db).map(hash => ({ hash, ...db[hash] }))).filter(
        (_, i) => i < 20,
    );
    res.json(results);
});

app.get("/api/hash/:hash", (req, res) => {
    res.json({ ...db[req.params.hash], hash: req.params.hash });
});

app.use("/wsinfo", (req, res) => {
    res.json({ endpoint: "http://127.0.0.1:" + PORT });
});

app.use("/api/", express.static(__dirname + "/songs/unzipped"));
app.use("/audioapi/:hash/:fileName", (req, res) => {
    res.set("Content-Type", "audio/ogg");
    res.sendFile(path.join(__dirname, "/songs/unzipped/", req.params.hash, req.params.fileName));
});

app.use(express.static(__dirname + "/build"));

server.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});
let rooms = {};
let roomDATA = {};
io.on("connection", socket => {
    console.log(" connected:", socket.id);
    socket.on("looking", data => {
        roomDATA[socket.id] = data;
    });
    socket.on("joinRoom", (roomID, callback) => {
        console.log(roomID, socket.id);
        rooms[roomID] = socket.id;
        rooms[socket.id] = roomID;
        roomDATA[socket.id] = roomDATA[roomID];
        callback(roomDATA[socket.id]);
        socket.to(roomID).emit("joined", socket.id);
    });
    socket.on("lose", data => {
        io.to(rooms[socket.id]).emit("win", data);
    });
    socket.on("starting", data => {
        console.log(rooms[socket.id]);
        if (rooms[socket.id]) {
            io.to(rooms[socket.id]).emit(data);
            io.to(socket.id).emit(data);
        } else {
            socket.emit("error", "You need to be joined by someone else!");
        }
    });
    socket.on("disconnect", () => {
        delete rooms[rooms[socket.id]];
        delete rooms[socket.id];
    });
});

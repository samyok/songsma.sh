import Nav from "./partials/Nav";
import { useCallback, useEffect, useState } from "react";
import logo from "./partials/logo.png";
import doubleblue from "./bluedouble.png";
import singlered from "./redsingle.png";
import "./App.sass";
import socketIOClient from "socket.io-client";
import Game from "./Game";

function GameLoadingScreen({ data, setPage }) {
    const [loading, setLoading] = useState("Loading..."); // any truthy value would be used.
    return (
        <>
            {!!loading && (
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0,0,0,0.7)",
                        position: "fixed",
                        top: 0,
                        left: 0,
                        color: "white",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: 50,
                    }}>
                    {loading}
                </div>
            )}
            <div>
                <Game setLoading={setLoading} data={data} setPage={setPage} />
            </div>
        </>
    );
}

function SongLoadingScreen({ setPage, data, socket }) {
    const [results, setResults] = useState([]);
    const [query, setQuery] = useState("");
    const onSearch = useCallback(() => {
        fetch("/search?q=" + query)
            .then(r => r.json())
            .then(r => setResults(r));
    }, []);
    useEffect(() => {
        fetch("/search?q=" + query)
            .then(r => r.json())
            .then(r => setResults(r));
    }, []);
    return (
        <>
            <Nav />
            <div className="songLoader">
                <div className="header">
                    Song Selection - {data.mode.toLocaleUpperCase().split("_").join(" ")}
                </div>
                {data.mode === "join_multiplayer" && (
                    <div className="header">Waiting to start!</div>
                )}
                <div className="search">
                    <button onClick={onSearch}>Re-roll songs</button>
                </div>
                <div className="listResults">
                    <ul>
                        {results.map(result => (
                            <li>
                                <img
                                    src={`/api/${result.hash}/${result._coverImageFilename}`}
                                    alt="cover art"
                                />
                                <div className="info">
                                    <h3>{result._songName}</h3>
                                    <p className={"author"}>{result._songAuthorName}</p>
                                    {result._difficultyBeatmapSets
                                        .filter(
                                            type =>
                                                type._beatmapCharacteristicName.toLowerCase() ===
                                                "standard",
                                        )[0]
                                        ._difficultyBeatmaps.map(diff => (
                                            <button
                                                onClick={() => {
                                                    fetch(
                                                        `/api/${result.hash}/${diff._beatmapFilename}`,
                                                    )
                                                        .then(r => r.text())
                                                        .then(r => {
                                                            setPage({
                                                                view:
                                                                    data.mode === "multiplayer"
                                                                        ? "waitforteam"
                                                                        : "game",
                                                                data: {
                                                                    hash: result.hash,
                                                                    level: JSON.parse(r),
                                                                    result,
                                                                },
                                                            });
                                                        });
                                                }}>
                                                {diff._difficulty}
                                            </button>
                                        ))}
                                    <p className={"info"}>⏱️{result._beatsPerMinute}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
}

function WaitForTeam({ data, socket, setPage }) {
    const [someoneJoined, setSomeoneJoined] = useState(false);
    useEffect(() => {
        socket.emit("looking", data);
        socket.on("joined", () => {
            setPage({ view: "game", data: { ...data, multiplayer: true, socket } });
        });
    }, []);
    return (
        <>
            <Nav />
            <div className="hero">
                {!someoneJoined && <h2>Waiting for someone to join you...</h2>}
                {someoneJoined && <h2>Someone joined!!!</h2>}
                {!someoneJoined && (
                    <p>
                        they should go to{" "}
                        <a style={{ color: "white" }} href={`https://songsma.sh/m/${socket.id}`}>
                            https://songsma.sh/m/{socket.id}
                        </a>
                    </p>
                )}
                {someoneJoined && <p>the game will start in a couple seconds</p>}
            </div>
        </>
    );
}

function GameFinishedScreen({ data, setPage }) {
    const [result, setResult] = useState({});
    useEffect(() => {
        fetch("/api/hash/" + window.location.pathname.split("/")[2])
            .then(r => r.json())
            .then(r => setResult(r));
    });
    let map = { win: 0, loss: 1, tie: 2 };
    let num = map[window.location.pathname.split("/")[4]];
    let messages = [
        ["won!", "lost :c", "tied?!?!"][num],
        [
            "You beat your opponent in the truest battle of true wits.",
            "you'll get 'em next time c:",
            "how did that happen???",
        ][num],
    ];
    return (
        <>
            <Nav />
            <div className="hero">
                <h2>You {messages[0]}</h2>
                <p>{messages[1]}</p>
                <div className="flex" style={{ textAlign: "center" }}>
                    <img
                        style={{ maxWidth: 200 }}
                        src={`/api/${result.hash}/${result._coverImageFilename}`}
                        alt=""
                    />
                    <h3 style={{ textAlign: "center" }}>
                        {result._songAuthorName} - ${result._songName}
                    </h3>
                    <h6>
                        Thank <u>${result._levelAuthorName}</u> for such writing the level :)!
                    </h6>
                    <button onClick={() => (window.location.href = "/re/")}>Play again</button>
                </div>
            </div>
        </>
    );
}

export default function App() {
    const [page, setPage] = useState({
        view: "home",
        data: {},
    });

    useEffect(() => {
        console.log(page);
    }, [page]);

    const [socket, setSocket] = useState({});
    useEffect(() => {
        if (window.location.href.includes("/win/")) {
            setPage({ view: "gameFinished", data: null });
        } else if (window.location.href.includes("/m/")) {
            // setPage({ view: "songLoader", data: { mode: "join_multiplayer" } });
        } else if (window.location.href.includes("/re/")) {
            setPage({ view: "selectMode", data: { mode: "" } });
        }
        fetch("/wsinfo")
            .then(r => r.json())
            .then(r => {
                const s = socketIOClient(r.endpoint);
                setSocket(s);
                console.log({ s });
                // s.on("starting", data => {
                //     console.log("STARTINGS DAKSSAJ JADSIJASDIO");
                //     setPage("game", { ...data, multiplayer: true, socket });
                // });
                if (window.location.pathname.includes("/m/")) {
                    s.emit("joinRoom", window.location.pathname.split("/")[2], data => {
                        setPage({ view: "game", data: { ...data, multiplayer: true, socket } });
                    });
                }
            });
    }, []);

    return (
        <>
            {page.view === "home" && (
                <>
                    <Nav />
                    <div className="hero">
                        <h2>No VR headset?</h2>
                        <p>Use your webcam to exercise to your favorite songs!</p>
                        <button onClick={() => setPage({ view: "selectMode", data: {} })}>
                            Play now
                        </button>
                    </div>
                </>
            )}
            {page.view === "selectMode" && (
                <>
                    <Nav />
                    <div className="selectMode">
                        <div
                            className="choice"
                            onClick={() => setPage({ view: "songLoader", data: { mode: "solo" } })}>
                            <img src={singlered} alt="SOLO" />
                            <p>SOLO</p>
                        </div>
                        <div
                            className="choice"
                            onClick={() =>
                                setPage({ view: "songLoader", data: { mode: "multiplayer" } })
                            }>
                            <img src={doubleblue} alt="Multiplayer" />
                            <p>MULTIPLAYER</p>
                        </div>
                    </div>
                </>
            )}
            {page.view === "songLoader" && (
                <SongLoadingScreen setPage={setPage} data={page.data} socket={socket} />
            )}
            {page.view === "gameFinished" && (
                <GameFinishedScreen data={page.data} setPage={setPage} />
            )}
            {page.view === "game" && <GameLoadingScreen data={page.data} setPage={setPage} />}
            {page.view === "waitforteam" && (
                <WaitForTeam data={page.data} setPage={setPage} socket={socket} />
            )}
        </>
    );
}

import React, { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import "@tensorflow/tfjs-backend-webgl";
import * as posenet from "@tensorflow-models/posenet";
import { useInterval } from "./utils";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import "./App.sass";

// import * as Stats from "stats.js";

class Queue {
    _a = [];
    _n;

    constructor(n) {
        this._n = n;
    }

    add(b) {
        this._a.push(b);
        if (this._a.length > this._n) this._a.shift();
    }

    velocity() {
        return (this._a[0] - this._a[this._a.length - 1]) / this._a.length;
    }
}

// const stats = new Stats();
// stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom

function Game({ setLoading, data, setPage }) {
    const {
        hash, // the hash of the song, all song files under /api/hash/
        level, // level data (ExpertPlus.dat)
        result, // result = search result (info.dat)
        multiplayer,
        socket,
    } = data;

    const useAudio = url => {
        const [audio] = useState(new Audio(url));
        const [playing, setPlaying] = useState(false);

        const toggle = () => setPlaying(!playing);

        useEffect(() => {
            playing ? audio.play() : audio.pause();
        }, [playing]);

        useEffect(() => {
            audio.addEventListener("ended", () => setPlaying(false));
            return () => {
                audio.removeEventListener("ended", () => setPlaying(false));
            };
        }, []);

        return [playing, toggle];
    };

    var bpm = result._beatsPerMinute;
    var songStartTime = Date.now();

    const sleep = n => new Promise(r => setTimeout(r, n));
    const [musicIsPlaying, toggleMusic] = useAudio(`/audioapi/${hash}/${result._songFilename}`);

    const Cam = useRef();
    const Cvs = useRef();

    const POSEFPS = 25;

    // debug
    const [debug, setDebug] = useState("string");

    // pn model
    const [model, setModel] = useState();
    const [pose, setPose] = useState();
    const [calibration, setCalibrationValue] = useState(100);

    // camera
    const [deviceId, setDeviceId] = useState(localStorage.getItem("CameraId") || {});
    const [devices, setDevices] = useState([]);
    const [wcData, setWCData] = useState(null);

    // sabers
    const [leftSaber, setLeftSaber] = useState(null);
    const [rightSaber, setRightSaber] = useState(null);

    // velocities
    const [blueVX, setBlueVX] = useState(new Queue(Math.round(POSEFPS * 0.2)));
    const [blueVY, setBlueVY] = useState(new Queue(Math.round(POSEFPS * 0.2)));
    const [redVX, setBRedVX] = useState(new Queue(Math.round(POSEFPS * 0.2)));
    const [redVY, setRedVY] = useState(new Queue(Math.round(POSEFPS * 0.2)));

    // score stuffs
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(50);

    useEffect(() => {
        if (lives > 0) return;

        // if (multiplayer) socket.emit("loss", hash);
        window.location.href = `/win/${hash}/${score}/loss`;
        return setPage({ page: "gameFinsihed", data: { ...data, win: "lose", score } });
    }, [score, lives]);

    // directions
    const [blueD, setBlueD] = useState(null);
    const [redD, setRedD] = useState(null);

    // attach listeners
    useEffect(() => {
        window.addEventListener("resize", ev => {
            window.location.reload();
        });
        window.document.addEventListener("keypress", event => {
            if (event.key === "k") {
                // if (multiplayer) socket.emit("loss", hash);
                window.location.href = `/win/${hash}/${score}/loss`;
                setPage({ page: "gameFinished", data: { ...data, score, win: "lose" } });
            }
        });
    }, []);

    function compute() {}

    /*** Webcam Draw Loop ***/
    useInterval(() => {
        if (
            !model ||
            !Cam.current ||
            !Cam.current?.video ||
            Cam.current.video.readyState !== 4 ||
            !model?.estimateSinglePose ||
            !Cvs.current?.getContext
        ) {
            return;
        }
        model
            .estimateSinglePose(Cam.current.video, {
                flipHorizontal: true,
            })
            .then(ps => {
                if (!Cvs.current) return;
                let ctx = Cvs.current.getContext("2d");
                ctx.fillStyle = "red";
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ps.keypoints
                    .filter(kp => kp.score > 0.1)
                    .filter(kp => kp.part.includes("Wrist"))
                    .forEach(kp => {
                        ctx.fillRect(kp.position.x, kp.position.y, 6, 6);
                    });

                // drawing arm
                const noseX = ps.keypoints.filter(kp => kp.part === "nose")[0].position.x;

                setPose(pv => {
                    let kpObj = pv || {};
                    ps.keypoints.forEach(kp => {
                        kpObj[kp.part] = kp.position;
                    });
                    return kpObj;
                });
                if (pose) {
                    // parse poses
                    if (pose.leftWrist && pose.leftElbow) {
                        // ctx.strokeStyle = "green";
                        // ctx.lineWidth = 10;
                        // ctx.beginPath();
                        // ctx.moveTo(pose.leftWrist.x, pose.leftWrist.y);
                        // ctx.lineTo(pose.leftElbow.x, pose.leftElbow.y);
                        // ctx.stroke();
                        // ctx.lineWidth = 0;
                        // wcData.w wcData.
                        if (leftSaber) {
                            leftSaber.scene.scale.set(0.1, 0.1, 0.1);
                            leftSaber.scene.position.x = -2.5 + 5 * (pose.leftWrist.x / wcData.w);
                            leftSaber.scene.position.y = 2 - 3.5 * (pose.leftWrist.y / wcData.h);
                            leftSaber.scene.position.z = 6;
                            // let xthatwewanttogoto =
                            //     -2.5 +
                            //     5 * (pose.leftWrist.x / wcData.w);
                            // let xthatweareat = leftSaber.scene.position.x;
                            // let Kay = 0.3;
                            // let dx = xthatwewanttogoto - xthatweareat;
                            // let newVX = vx + Kay * dx;
                            // setVX(newVX);
                            // setDebug(vx);
                            // leftSaber.scene.position.x += Kay * dx;
                            //
                            // let ythatwewanttogoto =
                            //     3 + (-3 * (pose.leftElbow.y + pose.leftWrist.y)) / wcData.h;
                            // let ythatweareat = leftSaber.scene.position.y;
                            // let dy = ythatwewanttogoto - ythatweareat;
                            // let newVY = vy + Kay * dy;
                            // setVY(newVY);
                            // leftSaber.scene.position.y = Kay * dy;
                        }
                        if (rightSaber) {
                            rightSaber.scene.scale.set(0.1, 0.1, 0.1);
                            rightSaber.scene.position.x = -2.5 + 5 * (pose.rightWrist.x / wcData.w);
                            rightSaber.scene.position.y = 1 - 3 * (pose.rightWrist.y / wcData.h);
                            rightSaber.scene.position.z = 6;
                        }
                    }
                    // if (pose.rightWrist && pose.rightElbow) {
                    //     ctx.strokeStyle = "blue";
                    //     ctx.lineWidth = 10;
                    //     ctx.beginPath();
                    //     ctx.moveTo(pose.rightWrist.x, pose.rightWrist.y);
                    //     ctx.lineTo(pose.rightElbow.x, pose.rightElbow.y);
                    //     ctx.stroke();
                    //     ctx.lineWidth = 0;
                    // }
                }
            });
    }, 1000 / POSEFPS);

    // webcam switcher
    const handleDevices = useCallback(
        mediaDevices => {
            setLoading("Setting up webcam...");
            setDevices(mediaDevices.filter(({ kind }) => kind === "videoinput"));
        },
        [setDevices],
    );

    const onWCMedia = useCallback(async mediaStream => {
        console.log(mediaStream, Cam.current.video);
        while (
            !mediaStream.active ||
            !Cam.current.video ||
            Cam.current.video.readyState !== 4 ||
            !Cvs.current
        )
            await sleep(50);

        if (mediaStream.active && Cam.current.video) {
            let v = { w: Cam.current.video.videoWidth, h: Cam.current.video.videoHeight };
            setWCData(v);

            Cvs.current.height = v.h;
            Cvs.current.width = v.w;
            Cam.current.video.height = v.h;
            Cam.current.video.width = v.w;
            setLoading("Setting up TensorFlow...");
            posenetSetup({
                width: v.w,
                height: v.h,
            }).then(model => {
                setModel(model);
            });
        }
    }, []);

    useEffect(() => {
        navigator.mediaDevices.enumerateDevices().then(handleDevices);
    }, [handleDevices]);

    /** ML MODEL SETUP **/
    async function posenetSetup({ width, height }) {
        const net = await posenet.load({
            architecture: "MobileNetV1",
            outputStride: 16,
            inputResolution: { width, height },
            multiplier: 0.75,
        });
        // const net = await posenet.load({
        //     architecture: "ResNet50",
        //     outputStride: 32,
        //     inputResolution: { width: 250, height: 200 },
        //     quantBytes: 2,
        //     multiplier: 1,
        // });

        // const net = await posenet.load({
        //     inputResolution: { width: 640, height: 480 },
        //     scale: 0.8,
        // });
        console.log("loaded posenet.");
        return net;
    }

    /**
     *
     *
     * THREE JS SETUP
     *
     *
     */

    const [cubes, setCubes] = useState([]);
    const [renderer, setRenderer] = useState(null);
    const [scene, setScene] = useState();
    const [camera, setCamera] = useState();

    async function noteLoop() {
        if (!musicIsPlaying) setTimeout(() => toggleMusic(), 500);
        level._notes = level._notes.map(note => ({
            ...note,
            playAt: (60000 * note._time) / bpm + songStartTime, //; //5 / (0.0012 * bpm * POSEFPS)
        }));
        for (let i = 0; i < level._notes.length; i++) {
            await sleep(level._notes[i].playAt - Date.now());
            genCube(
                level._notes[i]._lineIndex,
                level._notes[i]._lineLayer,
                level._notes[i]._type,
                level._notes[i]._cutDirection,
            );
        }
        await sleep(3000);

        if (multiplayer) window.location.href = `/win/${hash}/${score}/tie`;
        else {
            window.location.href = `/win/${hash}/${score}/win`;
        }

        setPage({ page: "gameFinished", data: { ...data, score, win: "win" } });
    }

    useEffect(async () => {
        if (!pose) return;
        setLoading(false);
        setScene(new THREE.Scene());
    }, [pose]);

    const breakCubes = useCallback(
        (x, y) => {
            setLives(pv => Math.min(pv + 3, 100));
            return setCubes(pv => {
                for (let i = 0; i < pv.length; i++) {
                    if (!pv[i]) continue;
                    if (pv[i].scene.position.x === x && pv[i].scene.position.y === y) {
                        // setScore(pv => pv + (10 - pv[i].scene.position.z) * 10);
                        scene.remove(pv[i].scene);
                        pv.splice(i, 1);
                        return pv;
                    }
                }
                return pv;
            });
        },
        [scene],
    );
    useEffect(() => {
        if (!scene) return;
        scene.background = null;
        noteLoop().then(() => {
            console.log("done with loop");
        });

        setCamera(
            new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.2, 1000),
        );

        setRenderer(new THREE.WebGLRenderer({ alpha: true }));
    }, [scene]);
    const loader = new GLTFLoader();

    function genCube(lineIndex, lineLayer, type, cutDirection) {
        function postProcessingCube(gltf) {
            scene.add(gltf.scene);
            gltf.scene.position.z = 0;
            gltf.scene.position.x = lineIndex - 1.5;
            gltf.scene.position.y = lineLayer - 1.5;
            gltf.scene.scale.set(0.42, 0.42, 0.42);
            gltf.scene.rotation.x += Math.PI;
            gltf.scene.rotation.z += Math.PI;
            setCubes(pv => [...pv, { scene: gltf.scene, type, cutDirection }]);
            switch (cutDirection[0]) {
                case 0:
                    gltf.scene.rotation.z += Math.PI;
                    break;
                case 1:
                    break;
                case 2:
                    gltf.scene.rotation.z += Math.PI / 2;
                    break;
                case 3:
                    gltf.scene.rotation.z += (3 * Math.PI) / 2;
                    break;
                case 4:
                    gltf.scene.rotation.z += (5 * Math.PI) / 4;
                    break;
                case 5:
                    gltf.scene.rotation.z += Math.PI / 4;
                    break;
                case 6:
                    gltf.scene.rotation.z += (7 * Math.PI) / 4;
                    break;
                case 7:
                    gltf.scene.rotation.z += (5 * Math.PI) / 4;
            }
        }

        if (type === 0) loader.load("/redbox.glb", postProcessingCube);

        if (type === 1) loader.load("/bluebox.glb", postProcessingCube);
    }

    function genSaber({ x, y, z, file, rotX, rotY, rotZ, callback }) {
        loader.load(file, gltf => {
            scene.add(gltf.scene);
            gltf.scene.scale.set(0.42, 0.42, 0.42);
            gltf.scene.position.x = x;
            gltf.scene.position.y = y;
            gltf.scene.position.z = z;
            gltf.scene.rotation.x = rotX;
            gltf.scene.rotation.y = rotY;
            gltf.scene.rotation.z = rotZ;
            if (callback) callback(gltf);
        });
    }

    useEffect(() => {
        if (!renderer || !scene) return;
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.outputEncoding = THREE.sRGBEncoding;
        document.body.appendChild(renderer.domElement);

        const playingFieldGeo = new THREE.PlaneGeometry(4, 5000, 1);
        const fieldColor = new THREE.MeshBasicMaterial({
            color: "white",
            side: THREE.DoubleSide,
            opacity: 0.5,
            transparent: true,
        });

        const playingField = new THREE.Mesh(playingFieldGeo, fieldColor);

        playingField.rotateX(Math.PI / 2);
        playingField.position.y -= 2;

        scene.add(playingField);

        let lights = [];
        lights[0] = new THREE.PointLight(0xffffff, 5, 0);
        lights[1] = new THREE.PointLight(0xffffff, 0.1, 0);

        lights[0].position.set(0, 200, 5);
        lights[1].position.set(0, 0, 200);

        for (let i = 0; i < lights.length; i++) {
            scene.add(lights[i]);
        }

        scene.fog = new THREE.Fog("black", 5, 15);

        // const composer = new EffectComposer( renderer );

        // document.body.appendChild(stats.dom);
        // this func is called whenever the resources are available for it

        // genCube(0, 0, 0, [4, 0, 2]);
        // genCube(1, 1, 1, [2]);
        // genCube(2, 2, 0, [6, 1, 2]);
        // genCube(3, 2, 1, [7, 1, 3]);
        genSaber({
            x: 0,
            y: 0,
            z: 6,
            file: "/bluesphere.glb",
            rotZ: Math.PI / 2,
            rotY: 0,
            rotX: 0,
            callback: gltf => setRightSaber(gltf),
        });
        genSaber({
            x: 0,
            y: 0,
            z: 6,
            file: "/redsphere.glb",
            rotZ: Math.PI / 2,
            rotY: 0,
            rotX: 0,
            callback: gltf => setLeftSaber(gltf),
        });
        // setTimeout(() => breakCubes(3, 2), 1000);

        camera.position.z = 10;
    }, [renderer]);

    useInterval(() => {
        // stats.begin();
        if (!renderer) return;
        for (let i = 0; i < cubes.length; i++) {
            cubes[i].scene.position.z += 0.0012 * bpm;
            if (cubes[i].scene.position.z > 7.5) {
                scene.remove(cubes[i].scene);
                cubes.splice(i, 1);
                setLives(pv => Math.max(0, pv - 15));
            }
        }

        if (leftSaber && rightSaber) {
            blueVX.add(leftSaber.scene.position.x);
            blueVY.add(leftSaber.scene.position.y);
            redVX.add(rightSaber.scene.position.x);
            redVY.add(rightSaber.scene.position.y);
        }

        if (rightSaber)
            for (let i = 0; i < cubes.length; i++) {
                if (
                    Math.abs(cubes[i].scene.position.x - rightSaber.scene.position.x) < 0.75 &&
                    Math.abs(cubes[i].scene.position.y - rightSaber.scene.position.y) < 0.75 &&
                    Math.abs(cubes[i].scene.position.z - 6) < 1 &&
                    cubes[i].type === 1
                ) {
                    console.log("BREAK", cubes[i].cutDirection, redD);
                    breakCubes(cubes[i].scene.position.x, cubes[i].scene.position.y);
                }
            }

        if (leftSaber)
            for (let i = 0; i < cubes.length; i++) {
                if (
                    Math.abs(cubes[i].scene.position.x - leftSaber.scene.position.x) < 0.75 &&
                    Math.abs(cubes[i].scene.position.y - leftSaber.scene.position.y) < 0.75 &&
                    Math.abs(cubes[i].scene.position.z - 6) < 1 &&
                    cubes[i].type === 0
                ) {
                    breakCubes(cubes[i].scene.position.x, cubes[i].scene.position.y);
                }
            }

        // if (blueD!=8) {
        //     console.log("red "+String(blueD));
        // }
        // if (redD!=8) {
        //     console.log("blue "+String(redD));
        // }
        // console.log(blueVX.velocity());

        renderer.render(scene, camera);
        // const renderPass = new RenderPass( scene, camera );
        // composer.addPass( renderPass );
        // composer.render();
        // stats.end();
    }, 1000 / POSEFPS);

    const resetCalibration = useCallback(() => {
        if (!pose) return;
        let distance = Math.sqrt(
            (pose.leftWrist.x - pose.leftElbow.x) ** 2 + (pose.leftWrist.y - pose.leftElbow.y) ** 2,
        );
        setCalibrationValue(distance);
    }, [pose]);
    return (
        <>
            <div>
                <select
                    value={deviceId}
                    onChange={event => {
                        setDeviceId(event.currentTarget.value);
                        localStorage.setItem("CameraId", event.currentTarget.value);
                    }}>
                    {devices.map((device, key) => (
                        <option value={device.deviceId} key={device.deviceId}>
                            {device.label || `Device ${key + 1}`}
                        </option>
                    ))}
                </select>
                {/*<button onChange={resetCalibration}>Set Max {calibration}</button>*/}
                <br />
                <div
                    style={{
                        position: "relative",
                        minHeight: 500,
                    }}>
                    <Webcam
                        ref={Cam}
                        key={JSON.stringify(wcData)}
                        audio={false}
                        mirrored={true}
                        videoConstraints={{
                            deviceId: deviceId,
                            width: { ideal: 250 },
                            height: { ideal: 200 },
                        }}
                        onUserMedia={onWCMedia}
                        style={{ position: "absolute", top: 0, left: 0 }}
                    />
                    <div className="score-container">
                        <div className="score" style={{ width: `${lives}%` }}>
                            &nbsp;
                        </div>
                    </div>
                    <canvas
                        ref={Cvs}
                        style={{ position: "absolute", top: 0, left: 0, zIndex: 999999 }}
                    />
                </div>
            </div>
        </>
    );
}

export default Game;

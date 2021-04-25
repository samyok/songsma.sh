import React, { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import Webcam from "react-webcam";
import "@tensorflow/tfjs-backend-webgl";
import * as posenet from "@tensorflow-models/posenet";
import { sleep, useInterval } from "./utils";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as Stats from "stats.js";

class Queue {
    _a = [];
    _n;

    constructor(n) {
        this._n = n;
    };

    add(b) {
        this._a.push(b);
        if (this._a.length > this._n) this._a.shift();
    }

    velocity() {
        return (this._a[0] - this._a[this._a.length - 1]) / this._a.length;
    }
}


const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
function App(callback, deps) {
    const Cam = useRef();
    const Cvs = useRef();

    const POSEFPS = 10;

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
    const [blueSaber, setBlueSaber] = useState(null);
    const [redSaber, setRedSaber] = useState(null);

    // velocities
    const [blueVX, setBlueVX] = useState(new Queue(Math.round(POSEFPS * 0.2)));
    const [blueVY, setBlueVY] = useState(new Queue(Math.round(POSEFPS * 0.2)));
    const [redVX, setBRedVX] = useState(new Queue(Math.round(POSEFPS * 0.2)));
    const [redVY, setRedVY] = useState(new Queue(Math.round(POSEFPS * 0.2)));

    // directions
    const [blueD, setBlueD] = useState(null);
    const [redD, setRedD] = useState(null);

    // attach listeners
    useEffect(() => {
        window.addEventListener("resize", ev => {
            window.location.reload();
        });
    }, []);

    function compute() {

    }


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
                        if (blueSaber) {
                            blueSaber.scene.scale.set(0.1, 0.1, 0.1);
                            blueSaber.scene.position.x = -2.5 + 5 * (pose.leftWrist.x / wcData.w);
                            blueSaber.scene.position.y = 2 - 3.5 * (pose.leftWrist.y / wcData.h);
                            blueSaber.scene.position.z = 6;
                            // let xthatwewanttogoto =
                            //     -2.5 +
                            //     5 * (pose.leftWrist.x / wcData.w);
                            // let xthatweareat = blueSaber.scene.position.x;
                            // let Kay = 0.3;
                            // let dx = xthatwewanttogoto - xthatweareat;
                            // let newVX = vx + Kay * dx;
                            // setVX(newVX);
                            // setDebug(vx);
                            // blueSaber.scene.position.x += Kay * dx;
                            //
                            // let ythatwewanttogoto =
                            //     3 + (-3 * (pose.leftElbow.y + pose.leftWrist.y)) / wcData.h;
                            // let ythatweareat = blueSaber.scene.position.y;
                            // let dy = ythatwewanttogoto - ythatweareat;
                            // let newVY = vy + Kay * dy;
                            // setVY(newVY);
                            // blueSaber.scene.position.y = Kay * dy;
                        }
                        if (redSaber) {
                            redSaber.scene.scale.set(0.1, 0.1, 0.1);
                            redSaber.scene.position.x = -2.5 + 5 * (pose.rightWrist.x / wcData.w);
                            redSaber.scene.position.y = 1 - 3 * (pose.rightWrist.y / wcData.h);
                            redSaber.scene.position.z = 6;
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
        console.log("Loading posenet...");
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

    useEffect(async () => {
        setScene(new THREE.Scene());
    }, []);
    useEffect(() => {
        if (!scene) return;
        scene.background = null;

        setCamera(
            new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.2, 1000),
        );

        setRenderer(new THREE.WebGLRenderer({ alpha: true }));
    }, [scene]);
    const loader = new GLTFLoader();

    function genCube(lineIndex, lineLayer, type, cutDirection) {
        function postProcessingCube(gltf) {
            scene.add(gltf.scene);
            gltf.scene.position.z = 5;
            gltf.scene.position.x = lineIndex - 1.5;
            gltf.scene.position.y = lineLayer - 1.5;
            gltf.scene.scale.set(0.42, 0.42, 0.42);
            gltf.scene.rotation.x += Math.PI;
            gltf.scene.rotation.z += Math.PI;
            setCubes(pv => [...pv, { scene: gltf.scene, type, cutDirection }]);
            switch (cutDirection) {
                case 0:
                    gltf.scene.rotation.z += Math.PI;
                    break;
                case 1:
                    break;
                case 2:
                    gltf.scene.rotation.z += (3 * Math.PI) / 2;
                    break;
                case 3:
                    gltf.scene.rotation.z += Math.PI / 2;
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

        if (type === 0) loader.load("./redbox.glb", postProcessingCube);

        if (type === 1) loader.load("./bluebox.glb", postProcessingCube);
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

    function breakCube(x, y) {
        setCubes(pv => {
            for (let i = 0; i < pv.length; i++) {
                if (pv[i].scene.position.x=== x && pv[i].scene.position.y ===y) {
                    scene.remove(pv[i]);
                    pv.splice(i, 1);
                    return pv;
                }
            }
            return pv;
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

        document.body.appendChild(stats.dom);
        // this func is called whenever the resources are available for it

        genCube(0, 0, 0, 4);
        genCube(1, 1, 1, 5);
        genCube(2, 2, 0, 6);
        genCube(3, 2, 1, 7);
        genSaber({
            x: 0,
            y: 0,
            z: 6,
            file: "./bluesphere.glb",
            rotZ: Math.PI / 2,
            rotY: 0,
            rotX: 0,
            callback: gltf => setRedSaber(gltf),
        });
        genSaber({
            x: 0,
            y: 0,
            z: 6,
            file: "./redsphere.glb",
            rotZ: Math.PI / 2,
            rotY: 0,
            rotX: 0,
            callback: gltf => setBlueSaber(gltf),
        });
        // setTimeout(() => breakCube(3, 2), 1000);

        camera.position.z = 10;
    }, [renderer]);

    useInterval(() => {
        stats.begin();
        if (!renderer) return;
        for (let i = 0; i < cubes.length; i++) {
            cubes[i].scene.position.z += 0.00;
            if (cubes[i].scene.position.z > 7) {
                scene.remove(cubes[i]);
                cubes.splice(i, 1);
            }
        }

        if (blueSaber && redSaber) {
            blueVX.add(blueSaber.scene.position.x);
            blueVY.add(blueSaber.scene.position.y);
            redVX.add(redSaber.scene.position.x);
            redVY.add(redSaber.scene.position.y);
        }
        const temp = 0.1;
        const temp2 = temp * 1.6;
        if (Math.abs(blueVX.velocity()) < temp && blueVY.velocity() < -1 * temp) {
            setBlueD(0);
        } else if (Math.abs(blueVX.velocity()) < temp && blueVY.velocity() > temp) {
            setBlueD(1);
        } else if (Math.abs(blueVY.velocity()) < temp && blueVX.velocity() < -1 * temp) {
            setBlueD(3);
        } else if (Math.abs(blueVY.velocity()) < temp && blueVX.velocity() > temp) {
            setBlueD(2);
        } else if (blueVX.velocity() < -1 * temp2 && blueVY.velocity() < -1 * temp2) {
            setBlueD(5);
        } else if (blueVX.velocity() > temp2 && blueVY.velocity() < -1 * temp2) {
            setBlueD(4);
        } else if (blueVX.velocity() < -1 * temp2 && blueVY.velocity() > temp2) {
            setBlueD(7);
        } else if (blueVX.velocity() > temp2 && blueVY.velocity() > temp2) {
            setBlueD(6);
        } //else {
            //setBlueD(8);
        // }

        if (Math.abs(redVX.velocity()) < temp && redVY.velocity() < -1 * temp) {
            setRedD(0);
        } else if (Math.abs(redVX.velocity()) < temp && redVY.velocity() > temp) {
            setRedD(1);
        } else if (Math.abs(redVY.velocity()) < temp && redVX.velocity() < -1 * temp) {
            setRedD(3);
        } else if (Math.abs(redVY.velocity()) < temp && redVX.velocity() > temp) {
            setRedD(2);
        } else if (redVX.velocity() < -1 * temp2 && redVY.velocity() < -1 * temp2) {
            setRedD(5);
        } else if (redVX.velocity() > temp2 && redVY.velocity() < -1 * temp2) {
            setRedD(4);
        } else if (redVX.velocity() < -1 * temp2 && redVY.velocity() > temp2) {
            setRedD(7);
        } else if (redVX.velocity() > temp2 && redVY.velocity() > temp2) {
            setRedD(6);
        } //else {
            // setRedD(8);
        // }

        console.log(blueD, redD);

        if (redSaber)
            for (let i = 0; i < cubes.length; i++) {
                if(Math.abs(cubes[i].scene.position.x-redSaber.scene.position.x) < 0.5
                    && Math.abs(cubes[i].scene.position.y-redSaber.scene.position.y) < 0.5
                        && Math.abs(cubes[i].scene.position.z-6) < 100) {
                    console.log("MAYBE", cubes[i].cutDirection, redD);
                    if (cubes[i].cutDirection===redD) {
                        breakCube(cubes[i].scene.position.x, cubes[i].scene.position.y);
                        console.log("BROKEN");
                    }
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
        stats.end();
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
                <button onChange={resetCalibration}>Set Max {calibration}</button>
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
                    <pre
                        style={{
                            position: "fixed",
                            bottom: 0,
                            left: 0,
                            backgroundColor: "black",
                            color: "white",
                            fontSize: 20,
                        }}>
                        {debug}
                    </pre>
                    <canvas
                        ref={Cvs}
                        style={{ position: "absolute", top: 0, left: 0, zIndex: 999999 }}
                    />
                </div>
            </div>
        </>
    );
}

export default App;

import React, { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import Webcam from "react-webcam";
import "@tensorflow/tfjs-backend-webgl";
import * as posenet from "@tensorflow-models/posenet";
import { sleep, useInterval } from "./utils";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as Stats from "stats.js";

function App() {
    const Cam = useRef();
    const Cvs = useRef();

    const POSEFPS = 20;

    // pn model
    const [model, setModel] = useState();
    const [pose, setPose] = useState();

    // camera
    const [deviceId, setDeviceId] = useState(localStorage.getItem("CameraId") || {});
    const [devices, setDevices] = useState([]);
    const [wcData, setWCData] = useState(null);

    // attach listeners
    useEffect(() => {
        window.addEventListener("resize", ev => {
            window.location.reload();
        });
    }, []);

    /*** Webcam Draw Loop ***/
    useInterval(async () => {
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
        let ps = await model.estimateSinglePose(Cam.current.video, {
            flipHorizontal: true,
        });
        let ctx = Cvs.current.getContext("2d");
        ctx.fillStyle = "red";
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ps.keypoints
            .filter(kp => kp.score > 0.1)
            .filter(kp => kp.part.includes("Wrist") || kp.part.includes("Elbow"))
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
                ctx.strokeStyle = "green";
                ctx.lineWidth = 10;
                ctx.beginPath();
                ctx.moveTo(pose.leftWrist.x, pose.leftWrist.y);
                ctx.lineTo(pose.leftElbow.x, pose.leftElbow.y);
                ctx.stroke();
                ctx.lineWidth = 0;
            }
            if (pose.rightWrist && pose.rightElbow) {
                ctx.strokeStyle = "blue";
                ctx.lineWidth = 10;
                ctx.beginPath();
                ctx.moveTo(pose.rightWrist.x, pose.rightWrist.y);
                ctx.lineTo(pose.rightElbow.x, pose.rightElbow.y);
                ctx.stroke();
                ctx.lineWidth = 0;
            }
        }
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
        // const net = await posenet.load({
        //     architecture: "MobileNetV1",
        //     outputStride: 16,
        //     inputResolution: { width, height },
        //
        //     multiplier: 0.75,
        // });
        const net = await posenet.load({
            architecture: "ResNet50",
            outputStride: 32,
            inputResolution: { width: 250, height: 200 },
            quantBytes: 2,
            multiplier: 1,
        });
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

    useEffect(() => {
        const scene = new THREE.Scene();
        scene.background = null;

        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.2,
            1000,
        );

        const renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.outputEncoding = THREE.sRGBEncoding;
        document.body.appendChild(renderer.domElement);

        let cubes = [];

        const playingFieldGeo = new THREE.PlaneGeometry(4, 5000, 1);
        const fieldColor = new THREE.MeshBasicMaterial({
            color: "white",
            side: THREE.DoubleSide,
            opacity: 0.5,
            transparent: true,
        });

        const playingField = new THREE.Mesh(playingFieldGeo, fieldColor);

        playingField.rotateX(Math.PI / 2);
        playingField.position.y -= 1.5;

        scene.add(playingField);

        let lights = [];
        lights[0] = new THREE.PointLight(0xffffff, 5, 0);
        lights[1] = new THREE.PointLight(0xffffff, 0.1, 0);

        lights[0].position.set(0, 200, 5);
        lights[1].position.set(0, 0, 200);

        for (let i = 0; i < lights.length; i++) {
            scene.add(lights[i]);
        }
        //
        // const rectLight = new THREE.RectAreaLight(0xffff00, 0.5, 10, 5000);
        // rectLight.position.set(0, -10, 0);
        // rectLight.lookAt(0, 0, 0);
        //
        // scene.add(rectLight);
        //
        // const rectLightHelper = new RectAreaLightHelper(rectLight);
        // rectLight.add(rectLightHelper);
        //
        // const lineLight = new THREE.RectAreaLight(0xffff55, 0.2, 2, 5000);
        // lineLight.position.set(0, 1.5, 0);
        // lineLight.lookAt(0, 0, 0);
        // scene.add(lineLight);
        // const lineLightHelper = new RectAreaLightHelper(lineLight);
        // lineLight.add(lineLightHelper);

        scene.fog = new THREE.Fog("black", 5, 15);

        function genCube(lineIndex, lineLayer, type, cutDirection) {
            function postProcessingCube(gltf) {
                scene.add(gltf.scene);
                //gltf.scene.position.z = -50;
                gltf.scene.position.x = lineIndex - 1.5;
                gltf.scene.position.y = lineLayer - 1;
                gltf.scene.scale.set(0.42, 0.42, 0.42);
                gltf.scene.rotation.x += Math.PI;
                gltf.scene.rotation.z += Math.PI;
                cubes.push(gltf.scene);
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

            if (type === 0) {
                const loader = new GLTFLoader();
                loader.load("./redbox.glb", postProcessingCube);
            }
            if (type === 1) {
                const loader = new GLTFLoader();
                loader.load("./bluebox.glb", postProcessingCube);
            }
        }

        function breakCube(lineIndex, lineLayer) {
            let temp = cubes.length;
            for (let i = 0; i < temp; i++) {
                if (
                    Math.round(cubes[i].position.z) > 5 &&
                    Math.round(cubes[i].position.x + 1.5) === lineIndex &&
                    Math.round(cubes[i].position.y + 1) === lineLayer
                ) {
                    scene.remove(cubes[i]);
                    cubes.splice(i, 1);
                    return;
                }
            }
        }

        // const composer = new EffectComposer( renderer );
        var stats = new Stats();
        stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild(stats.dom);
        // this func is called whenever the resources are available for it
        const animate = function () {
            stats.begin();

            for (let i = 0; i < cubes.length; i++) {
                cubes[i].position.z += 0.08;
                if (cubes[i].position.z > 7) {
                    scene.remove(cubes[i]);
                    cubes.splice(i, 1);
                }
            }

            renderer.render(scene, camera);
            // const renderPass = new RenderPass( scene, camera );
            // composer.addPass( renderPass );
            // composer.render();
            stats.end();
            requestAnimationFrame(animate);
        };

        // genCube(0, 0, 0, 4);
        // genCube(1, 1, 1, 5);
        // genCube(2, 2, 0, 6);
        // genCube(3, 2, 1, 7);
        // setTimeout(() => breakCube(3, 2), 3000);

        camera.position.z = 10;
        requestAnimationFrame(animate);
    }, []);
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

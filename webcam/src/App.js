import React, { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import Webcam from "react-webcam";
import "@tensorflow/tfjs-backend-webgl";
import * as posenet from "@tensorflow-models/posenet";
import { sleep, useInterval } from "./utils";

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

    /*** Draw Loop ***/
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
        setPose(ps);
        let ctx = Cvs.current.getContext("2d");
        let noseXY = { x: ps.keypoints[0].position.x, y: ps.keypoints[0].position.y };
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.fillStyle = "red";
        ps.keypoints
            .filter(kp => kp.score > 0.1)
            .forEach(kp => {
                ctx.fillRect(kp.position.x, kp.position.y, 6, 6);
            });
    }, 1000 / POSEFPS);

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
        //     inputResolution: { width, height },
        //     quantBytes: 2,
        // });
        // const net = await posenet.load({
        //     inputResolution: { width: 640, height: 480 },
        //     scale: 0.8,
        // });
        console.log("loaded posenet.");
        return net;
    }

    useEffect(() => {
        navigator.mediaDevices.enumerateDevices().then(handleDevices);
    }, [handleDevices]);

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
                        videoConstraints={{ deviceId: deviceId }}
                        onUserMedia={onWCMedia}
                        style={{ position: "absolute", top: 0, left: 0 }}
                    />
                    <canvas
                        ref={Cvs}
                        style={{ position: "absolute", top: 0, left: 0, zIndex: 999999 }}
                    />
                </div>
                <br />
                <pre>
                    w: {wcData?.w} h: {wcData?.h} <br />
                    {JSON.stringify(pose, null, 4)}
                </pre>
            </div>
        </>
    );
}

export default App;

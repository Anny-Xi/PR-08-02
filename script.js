import { HandLandmarker, FilesetResolver, DrawingUtils } from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0";
import kNear from "./knear.js"

const k = 3
const machine = new kNear(k);

const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");
const enableWebcamButton = document.getElementById("webcamButton");
const canvasCtx = canvasElement.getContext("2d");
const drawingUtils = new DrawingUtils(canvasCtx);

const savedHands = [];
const saveButton = document.getElementById("save");


let handLandmarker = undefined;
let webcamRunning = false;
let lastVideoTime = -1;

const videoWidth = "480px"
const videoHeight = "270px"

// ********************************************************************
// if webcam access, load landmarker and enable webcam button
// ********************************************************************
function startApp() {
    const hasGetUserMedia = () => { var _a; return !!((_a = navigator.mediaDevices) === null || _a === void 0 ? void 0 : _a.getUserMedia); };
    if (hasGetUserMedia()) {
        createHandLandmarker();
    } else {
        console.warn("getUserMedia() is not supported by your browser");
    }
}

// ********************************************************************
// create mediapipe
// ********************************************************************
const createHandLandmarker = async () => {
    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 1
    });
    enableWebcamButton.addEventListener("click", enableCam);
    enableWebcamButton.innerText = "Start de Game!"
    console.log("HandLandmarker is ready!")
};


/********************************************************************
// Continuously grab image from webcam stream and detect it.
********************************************************************/
function enableCam(event) {
    console.log("start the webcam")
    if (!handLandmarker) {
        console.log("Wait! handLandmaker not loaded yet.");
        return;
    }
    webcamRunning = true;
    enableWebcamButton.innerText = "Predicting";
    enableWebcamButton.disabled = true

    //width and heigt for the video canvas
    const constraints = {
        video: {
            width: { exact: 480 },
            height: { exact: 270 }
        }
    };

    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        video.srcObject = stream;
        video.addEventListener("loadeddata", async () => {
            canvasElement.style.height = videoHeight;
            canvasElement.style.width = videoWidth;
            video.style.height = videoHeight;
            video.style.width = videoWidth;
            predictWebcam();
        });
    });
}
// ********************************************************************
// detect poses!!
// ********************************************************************
async function predictWebcam() {
    let results = undefined;
    let startTimeMs = performance.now();
    results = handLandmarker.detectForVideo(video, startTimeMs,);
    drawHand(results);

    if (webcamRunning === true) {
        window.requestAnimationFrame(predictWebcam);
    }
}

// ********************************************************************
// draw the poses or log them in the console
// ********************************************************************
function drawHand(result) {
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    // log de coordinaten
    // console.log(result)

    // teken de coordinaten in het canvas
    for (const landmark of result.landmarks) {
        // console.log(landmark);
        drawingUtils.drawLandmarks(landmark, { color: "#FF0000", radius: 1 });
        drawingUtils.drawConnectors(landmark, HandLandmarker.HAND_CONNECTIONS, {
            color: "#00FF00",
            lineWidth: 1
        });

        for (const markPosition of landmark) {
            // console.log(`x position ${markPosition.x} y position ${markPosition.y}`);
            savedHands.push(markPosition.x, + markPosition.y);

        }

        const hands = JSON.stringify(savedHands);

        saveButton.addEventListener("click", () => {
            localStorage.setItem("left", hands);
            console.log(localStorage.getItem("left"))
        });
    }

    //clear array for the hand landmarks
    savedHands.length = 0;

}


startApp()

import { HandLandmarker, FilesetResolver, DrawingUtils } from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0";

const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");
const enableWebcamButton = document.getElementById("webcamButton");
const canvasCtx = canvasElement.getContext("2d");
const drawingUtils = new DrawingUtils(canvasCtx);

const labelButton = document.getElementById("label");
labelButton.addEventListener("click", addLabelHandler);

let handLandmarker = undefined;
let webcamRunning = false;
let lastVideoTime = -1;

const videoWidth = "480px"
const videoHeight = "270px"

// neurol network aanmaken
const nn = ml5.neuralNetwork({ task: 'classification', debug: true });


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

    }
}

// key event 
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            saveHandler("up");
            break;
        case 'ArrowDown':
            saveHandler("down");
            break;
        case 'ArrowLeft':
            saveHandler("left");
            break;
        case 'ArrowRight':
            saveHandler("right");
            break;
    }
});

// localstorage hand datas bewaren van bijbehorende lable
function saveHandler(direction) {
    let startTimeMs = performance.now();
    const results = handLandmarker.detectForVideo(video, startTimeMs);

    if (results.landmarks.length === 0) {
        return;
    }
    console.log(results.landmarks[0]);
    let savedHands = [];
    for (const markPosition of results.landmarks[0]) {
        // console.log(`x position ${markPosition.x} y position ${markPosition.y}`);
        savedHands.push(markPosition.x, + markPosition.y, +markPosition.x);
    }
    // lege tempArray = []
    let handArray = []
    // localstorage ophalen
    // als leeg
    // als niet leeg
    if (localStorage.getItem(direction)) {
        // push naar tempArray
        // omzetten naar array
        handArray = JSON.parse(localStorage.getItem(direction));
    }

    // push naar array
    handArray.push(savedHands);
    // omzetten naar json
    console.log(handArray)
    const handJson = JSON.stringify(handArray);

    // localstorage setItem
    localStorage.setItem(direction, handJson);

}

// fucntion om alle data gereedt maken voor trainen
function addLabelHandler() {
    let data = []

    labelData(data, "left");
    labelData(data, "right");
    labelData(data, "up");
    labelData(data, "down");

    data = data.toSorted(() => (Math.random() - 0.5));


    addDataHandler(data, nn);

    nn.saveData('hands-datas');
}

// localstorage data labellen -> training data gereed maken
function labelData(data, direction) {

    // halen localstorage met dat label
    let hands = JSON.parse(localStorage.getItem(direction));

    // als er geen data is, terug naar functie
    if (hands.length === 0) {
        return;
    }
    // push dat naar het data met label
    for (const hand of hands) {
        data.push({ pose: hand, label: direction })
    }

}


function addDataHandler(data, nn) {
    for (const train of data) {
        // console.log(`the data is [${train.pose}], { label: ${train.label} }`);
        nn.addData(train.pose, { label: train.label });
    }
    nn.normalizeData();
}

startApp()

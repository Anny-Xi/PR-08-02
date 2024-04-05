import {startApp, handLandmarker, video} from './mediapipe-connection.js';

const predictButton = document.getElementById("prediction");
predictButton.addEventListener("click", finishedTraining);



// neurol network aanmaken
const nn = ml5.neuralNetwork({ task: 'classification', debug: true });

const modelInfo = {
    model: 'model/model.json',
    metadata: 'model/model_meta.json',
    weights: 'model/model.weights.bin',
};
nn.load(modelInfo, modelLoaded);


function modelLoaded() {
    console.log("model loaded");
}

async function finishedTraining() {

    let startTimeMs = performance.now();
    const detection = handLandmarker.detectForVideo(video, startTimeMs);

    if (detection.landmarks.length === 0) {
        return;
    }
    let handData = [];
    for (const markPosition of detection.landmarks[0]) {
        handData.push(markPosition.x, + markPosition.y, +markPosition.x);
    }

    const results = await nn.classify(
            handData
    );
    console.log(results);
}

startApp()

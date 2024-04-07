import { startApp, handLandmarker, video } from './mediapipe-connection.js';
import { saveHandler, labelData } from './collect.js'

const predictButton = document.getElementById("prediction");
predictButton.addEventListener("click", finishedTraining);


// key event 
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            saveHandler("up-test");
            break;
        case 'ArrowDown':
            saveHandler("down-test");
            break;
        case 'ArrowLeft':
            saveHandler("left-test");
            break;
        case 'ArrowRight':
            saveHandler("right-test");
            break;
    }
});


    // halen localstorage met dat label
    let hands = JSON.parse(localStorage.getItem(itemName));

    // als er geen data is, terug naar functie
    if (hands.length === 0) {
        return;
    }
    // push dat naar het data met label
    for (const hand of hands) {
        data.push({ pose: hand, label: direction })
    }




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
        savedHands.push(markPosition.x, + markPosition.y, +markPosition.z);
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

function addLabelHandler() {
    let data = []

    labelData(data, "left-test");
    labelData(data, "right-test");
    labelData(data, "up-test");
    labelData(data, "down-test");

    testData = data.toSorted(() => (Math.random() - 0.5));

}

async function finishedTraining() {

    // let testeData = addLabelHandler();
    let testeData = "test click";
    console.log (testeData);
    // const prediction = await nn.classify(testpose.pose);
    // console.log(`Ik voorspelde: ${prediction[0].label}. Het correcte antwoord is: ${testpose.label}`)
}

startApp()

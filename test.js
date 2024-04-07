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

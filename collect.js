import {startApp, handLandmarker, video} from './mediapipe-connection.js';

const labelButton = document.getElementById("label");
labelButton.addEventListener("click", addLabelHandler);

// neurol network aanmaken
const nn = ml5.neuralNetwork({ task: 'classification', debug: true });


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

export {saveHandler, labelData, addLabelHandler}

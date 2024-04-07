import { startApp, handLandmarker, video, webcamRunning } from './mediapipe-connection.js';

const game = document.getElementById("game");
game.addEventListener("click", gameStart);

const message = document.getElementById("message");

let gamePose = document.getElementById("pose");

let playerScore = document.getElementById("player_score");



const richting = ["links", "rechts", "boven", "beneden"];
const checkRichting = ["right", "left", "up", "down"]

let startTimer = 5;

let startScore = 0


function gameStart() {
    let gameEnd = false;

    let chance = 3;

    const gameButtonSection = document.getElementById("game-buttons");

    const nextRoundButton = document.createElement("button");
    nextRoundButton.textContent = "Next round";

    nextRoundButton.addEventListener("click", function () {
        alert("Button clicked!");
    });
    gameButtonSection.appendChild(nextRoundButton);


    // wacht om camera te starten. 
    if (!webcamRunning) {
        message.innerHTML = "De camera is nog niet opgestaart";
        return;
    }

    // game opstarten

    message.innerHTML = "Game start it";

    // game heeft een random richting van de vier


    // timer opstarten
    if (!gameEnd) {
        let setGame = directionHandler(richting, checkRichting);
        gamePose.innerHTML = setGame[0];
        // speler doet een pose en wacht tot time out
        countDownHandler(startTimer, setGame[1]);

        playerScore.innerHTML = startScore;
    }


    // als chance = 0 

    // gameEnd = true


}



function countDownHandler(seconds, pose) {
    const timer = setInterval(() => {
        message.innerHTML = seconds
        seconds--;

        if (seconds < 0) {
            clearInterval(timer);

            if (playerDetactHandler(pose)) {
                return true
            } else if (!playerDetactHandler(pose)) {
                return false
            }

        }
    }, 1000);
}

function directionHandler(directions, answer) {
    let number = Math.floor(Math.random() * 4);
    let randomDirection = directions[number];
    let answerDirection = answer[number];

    let setAnswer = [randomDirection, answerDirection];

    return setAnswer;
}



// neurol network aanmaken
const nn = ml5.neuralNetwork({ task: 'classification', debug: true });

// model informatie ophallen
const modelInfo = {
    model: 'model/model.json',
    metadata: 'model/model_meta.json',
    weights: 'model/model.weights.bin',
};

// model inladen
nn.load(modelInfo, modelLoaded);


function modelLoaded() {
    console.log("model loaded");
}

async function playerDetactHandler(correctPose) {

    let startTimeMs = performance.now();
    const detection = handLandmarker.detectForVideo(video, startTimeMs);

    if (detection.landmarks.length === 0) {
        return;
    }
    let handData = [];
    for (const markPosition of detection.landmarks[0]) {
        handData.push(markPosition.x, + markPosition.y, +markPosition.x);
    }
    const results = await nn.classify(handData);

    let pose = results[0].label

    // Model vergelijk de data  <Links <-> rechts | boven <-> beneden>
    if (pose === correctPose) {
        console.log("pose correct");
        return true;
    } else {
        console.log("pose niet correct");
        return false;
    }

}

startApp();
// finishedTraining();

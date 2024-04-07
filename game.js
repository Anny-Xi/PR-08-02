import { startApp, handLandmarker, video, webcamRunning } from './mediapipe-connection.js';

const game = document.getElementById("game");
game.addEventListener("click", gameStart);

const message = document.getElementById("message");

let gamePose = document.getElementById("pose");

let playerScore = document.getElementById("player_score");
let playerChance = document.getElementById("player_chance");

const richting = ["links", "rechts", "omhoog", "omlaag"];
const checkRichting = ["right", "left", "down", "up"]

function gameStart() {
    game.disabled = true;

    let gameEnd = false;
    let startScore = 0
    let chance = 3;
    let startTimer = 3;

    // wacht om camera te starten. 
    if (!webcamRunning) {
        message.innerHTML = "De camera is nog niet opgestaart";
        return;
    }

    // game opstarten

    message.innerHTML = "Game start it";

    // start speler gegevens opslagen
    setScoreHandler(startTimer, startScore, chance)

    // button toevoegen volgende ronden

    const gameButtonSection = document.getElementById("game-buttons");

    const nextRoundButton = document.createElement("button");
    nextRoundButton.setAttribute('id', 'next');
    nextRoundButton.textContent = "Next round";
    nextRoundButton.disabled = false;

    gameButtonSection.appendChild(nextRoundButton);


    // eerste ronden opstarten.
    if (!gameEnd) {
        // speler doet een pose en wacht tot time out
        countDownHandler(startTimer, startScore, chance);

        playerChance.innerHTML = `Je heb nog ${chance} kansen`;
        playerScore.innerHTML = `Jouw score is ${startScore}`;

        nextRoundButton.addEventListener("click", nextRoundHandler);
    }

    // als chance = 0 

    // gameEnd = true


}
function setScoreHandler(timer, score, chance) {
    localStorage.setItem('timer', timer);
    localStorage.setItem('score', score);
    localStorage.setItem('chance', chance);
}


function nextRoundHandler() {
    let time = localStorage.getItem('timer');
    let score = localStorage.getItem('score');
    let chance = localStorage.getItem('chance');

    countDownHandler(time, score, chance);
}

async function countDownHandler(seconds, score, chance) {

    let nextRoundButton = document.getElementById('next')

    let second = seconds;
    let setGame = directionHandler(richting, checkRichting);
    gamePose.innerHTML = setGame[0];
    let correctPose = setGame[1];

    const timer = setInterval(async () => {
        nextRoundButton.disabled = true;
        message.innerHTML = seconds
        seconds--;

        if (seconds < 0) {
            clearInterval(timer);
            let results = await playerDetactHandler(correctPose);
            console.log(results);

            if (results) {
                score++;
            } else if (!results) {
                chance--;
            }

            if (chance < 0) {
                alert('Je bent verloren');
                nextRoundButton.disabled = true;
                return
            }
            nextRoundButton.disabled = false;

            setScoreHandler(second, score, chance)

            playerChance.innerHTML = `Je heb nog ${chance} kansen`;
            playerScore.innerHTML = `Jouw score is ${score}`;

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
    //correctPose

    let correct = false;

    let startTimeMs = performance.now();
    const detection = handLandmarker.detectForVideo(video, startTimeMs);
    let handData = [];
    if (detection.landmarks.length === 0) {
        return;
    }
    for (const markPosition of detection.landmarks[0]) {
        handData.push(markPosition.x, + markPosition.y, +markPosition.x);
    }
    const results = await nn.classify(handData);

    let pose = results[0].label

    // Model vergelijk de data  <Links <-> rechts | boven <-> beneden>
    if (pose === correctPose) {
        console.log("pose correct");
        console.log(pose);
        correct = true;
        return correct;
    } else {
        console.log("pose niet correct");
        console.log(pose);
        return correct;
    }
}

startApp();
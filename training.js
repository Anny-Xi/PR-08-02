import {startApp} from './mediapipe-connection.js';

const predictButton = document.getElementById("prediction");
predictButton.addEventListener("click", predictHandler);

// neurol network aanmaken
const nn = ml5.neuralNetwork({ task: 'classification', debug: true });
nn.loadData('hands-datas.json')


// data trainen en opslaan
function predictHandler(){
    nn.train({ epochs: 32 }, () => nn.save());
}

startApp()

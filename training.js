import { startApp } from './mediapipe-connection.js';

const predictButton = document.getElementById("prediction");
predictButton.addEventListener("click", predictHandler);

// neurol network aanmaken

const options = {
    task: 'classification',
    debug: true,
    layers: [
        {
            type: 'dense',
            units: 32,
            activation: 'relu',
        }, {
            type: 'dense',
            units: 32,
            activation: 'relu',
        },
        {
            type: 'dense',
            activation: 'softmax',
        },
    ]
};

const nn = ml5.neuralNetwork({ task: 'classification', debug: true });
// const nn = ml5.neuralNetwork(options);

// nn.loadData('hands-datas.json')
nn.loadData('hands-datas-2.json')

// data trainen en opslaan
function predictHandler() {
    nn.train({ epochs: 32 }, () => nn.save());
}

startApp()

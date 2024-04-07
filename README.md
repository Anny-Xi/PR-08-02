# PR-08-02

# Het hersen kraker

## Installatie ?

Voor dit applicatie hoef er geen installatie gedaan te worden/


## Als je eigen model willen traien 

Klik op button met tekst "Klik hier om eigen model te trainen" en volg de instuctie.

### Pose data opslagen

De data wordt opgeslagen als een json bestand met naam hand-data, je kan zelf deze naam wijzigen. Let wel op dat de naam bij de loadData ook aangepast wordt. (training.js - line 30)
```sh
nn.loadData('naameJson.json', console.log("load data"))
```

### Pose data trainen en testen

De model wordt getraint met meegegeven data, hierna wordt 3 bestand gedownload. 
Verplaats dat allemaal in een map binnen dit project. 

en verandert de volgende gegevens in test.js naar jouw eigen.

```sh
const modelInfo = {
    model: 'model/model.json',
    metadata: 'model/model_meta.json',
    weights: 'model/model.weights.bin',
};
```


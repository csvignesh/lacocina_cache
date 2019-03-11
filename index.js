'use strict';

const express = require('express');
const app = express();
const yelpClient = require('./yelpClient');
const gSheetClient = require('./gSheet-client');

app.set('port', (process.env.PORT || 8080));
app.use(express.static(__dirname + '/public'));

// enabling CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Cache-Control", "no-cache");
    next();
});

app.get('/', async (req, res) => {
    const data = await (yelpClient.getDataFor(req.query.id));
    res.send(data);
});

app.get('/all', async (req, res) => {
    const data = await (gSheetClient.getSheetData());
    res.send(data);
});

app.listen(app.get('port'), () => {
    console.log("Node app is running at localhost:" + app.get('port'));
});

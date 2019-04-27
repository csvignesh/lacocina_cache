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
    const ids = await (gSheetClient.getSheetData());
    const data = await Promise.all(ids.map(id => {
        return new Promise(async (resolve) => {
            const details = await (yelpClient.getDataFor(id));
            resolve(details)
        });
    })).catch(error => {
        console.log(error.message);
    });
    res.send(data);
});

app.listen(app.get('port'), () => {
    console.log("Node app is running at localhost:" + app.get('port'));
    warmUpCache();
});

const warmUpCache = async () => {
    console.log("Warming up - yelp data");
    const ids = await (gSheetClient.getSheetData());
    for (const id of ids) {
        try {
            const data = await yelpClient.getDataFor(id);
            if(!data.id) {
                console.error(`Error fetching ${id}`);
            }
        } catch(e) {
            console.log(`Exception while fetching ${id}`, e)
        }
    };
    console.log(`warmed up - ${ids.length}`);
};

'use strict';

const express = require('express');
const app = express();
const yelpClient = require('./yelpClient');
const yelpCrawler = require('./yelpImageCrawler');
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

app.get('/with', async (req, res) => {
    const data = await (yelpClient.getDataFor(req.query.id));
    res.send(data);
});

app.get('/photos', async (req, res) => {
    res.send(yelpCrawler.getPhotos(req.query.id) || []);
});

app.get('/all', async (req, res) => {
    const places = await (gSheetClient.getSheetData());
    const data = await Promise.all(places.map(place => {
        return new Promise(async (resolve) => {
            const details = await (yelpClient.getDataFor(place.id));
            details.pinType = place.pinType;
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
    const places = await (gSheetClient.getSheetData());
    console.log(`Got ${places.length} to warm up`);
    for (const place of places) {
        try {
            const data = await yelpClient.getDataFor(place.id);
            if(!data.id) {
                console.error(`Error fetching ${place.id}`);
            }
        } catch(e) {
            console.log(`Exception while fetching ${place.id}`, e)
        }
    };
    console.log(`warmed up - ${places.length}`);
    // trigger photo crawl
    places.forEach(place => {
        yelpCrawler.crawl(place.id);
    });
};

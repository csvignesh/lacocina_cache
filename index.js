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

const getAll = async (req, res) => {
    const places = await (gSheetClient.getSheetData());
    const data = await Promise.all(places.map(placeSheetData => {
        return new Promise(async (resolve) => {
            if (placeSheetData.id === 'meta') {
                resolve(placeSheetData);
            }
            let details = await (yelpClient.getDataFor(placeSheetData.id));
            if(details) {
                details = Object.assign({}, details, placeSheetData);
                details.allPhotos = yelpCrawler.getPhotos(placeSheetData.id) || [];
            }
            resolve(details);
        });
    })).catch(error => {
        console.log(error.message);
    });
    res.send(data);
};

// heroku sleeps app if no traffic - so we ping from http://kaffeine.herokuapp.com/ every 30 mins
app.get('/', (req, res) => {
    getAll(req, res);
});

app.get('/with', async (req, res) => {
    const data = await (yelpClient.getDataFor(req.query.id));
    res.send(data);
});

app.get('/photos', async (req, res) => {
    res.send(yelpCrawler.getPhotos(req.query.id) || []);
});

app.get('/all', getAll);

app.listen(app.get('port'), () => {
    const refreshHoursInMS = (yelpClient.cacheOutDateTimeInHours * 60 * 60 * 1000) + 2000;
    console.log("Node app is running at localhost:" + app.get('port'));
    warmUpCache();
    setInterval(() => {
        warmUpCache();
    },  refreshHoursInMS);
});

const warmUpCache = async () => {
    console.log("Warming up - yelp data");
    const places = await (gSheetClient.getSheetData());
    // -1 for meta data
    console.log(`Got ${places.length - 1} to warm up`);
    for (const place of places) {
        if (place.id === 'meta') {
            continue;
        }
        try {
            const data = await yelpClient.getDataFor(place.id, true);
            if(!data.id) {
                console.error(`Error fetching ${place.id}`);
            }
        } catch(e) {
            console.log(`Exception while fetching ${place.id}`, e)
        }
    };
    console.log(`warmed up - ${places.length - 1}`);
    // trigger photo crawl
    places.forEach(place => {
        if (place.id === 'meta') {
            return;
        }
        yelpCrawler.crawl(place.id);
    });
};

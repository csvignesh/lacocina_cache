'use strict';

const express = require('express');
const request = require('request');
const app = express();

app.set('port', (process.env.PORT || 8080));
app.use(express.static(__dirname + '/public'));

const options = {
  url: 'https://api.yelp.com/v3/businesses/walia-ethiopian-cuisine-san-jose',
  headers: {
    'Authorization': 'Bearer LHmAorCggtmQbxWdPB-T-4tnh2VGSYkn4zWoMbBiJPFOeAsQqpDGWtbsdhNPJv7bs4yBJ8L8UIyBasdBKkKl5dxVq9MNHUd_zFOXp3jg4vLihxJ3PbKHKa8rwKSDXHYx'
  }
};

// enabling CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', (req, res) => {
  request(options, callback)
  res.send({
    apple: 3,
    orange: "2",
    fruit: {
      grape: 4
    }
  });
});

function callback(error, response, body) {
  console.log(body)
}

app.listen(app.get('port'), () => {
  console.log("Node app is running at localhost:" + app.get('port'));
});

# lacocina_cache

This repo consists of 5 modules.
* Google sheet client
* Yelp client
* Yelp image crawler
* Aggregator
* [find-us page](/find-us.html)

![Lacocina Cache Architecture](/lacocina_arch.png)

## Google sheet client
We have a google sheet, which holds the list of graduates along with additional information about them.

[gSheet-client.js](/gSheet-client.js) basically uses `googleapis` node module to retrieve, these information.

## Yelp client
Given a Yelp ID, this acts as a client for yelp, fetching the information about the restaurant.

Information includes Open Hours, first 3 images, etc., which we render on the page(find-us).

Yelp client caches data for `5 hours`, before it hits yelp for live data again.

Code - [yelpClient.js](/yelpClient.js)

## Yelp image crawler
Yelp api, by default only exposes top 3 images for any given ID(restaurant).
Yelp image crawler, runs through the yelp pages to gather all the images for a given ID(restaurant).

Code - [yelpImageCrawler.js](/yelpImageCrawler.js)

## Aggregator
Aggregator is a node https server, which gives us the JSON data of all the graduates, that has to be displayed on the find-us page.
Aggregator uses `Google sheet client`, `Yelp client`, `Yelp Image Crawler` to generate the live data of all the graduates.

The Aggregator runs on heroku as a node app.

Code - [index.js](/index.js)

## find-us page
This is the actual html/JS/CSS which will get embedded into the find-us.html page in the square space domain.
The Javascript which loads with the page, will hit the Aggregator for data, and paint the page with live data from the sheet and yelp.

It is stored in this repo, so that we have version control over the html/js/css changes. Square space does not let us do this.
So any change to the embedded html/js/css, will be made here and then updated(copy, pasted) into the square space find-us page.

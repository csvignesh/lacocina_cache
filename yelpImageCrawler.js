'use strict';

// use the yelp id, to hit the yelp photo pages and crawls the images
// fires parallel calls to crawl multiple pages
// once the crawling is done, puts it in the cache (in memory for now)
// if its takes in too much mem, start using file!!
const request = require('request');
const util = require('util');
const cheerio = require('cheerio');
const photosCache = {};

module.exports = {
    crawl: async (id) => {
        // do initial call to get the photos count
        // use the count and number of photos in a single page to determine how many pages has to be crawled

        if (!id) {
            return {'err': 'id missing'}
        }

        const options = {
            url: `https://www.yelp.com/biz_photos/${encodeURIComponent(id)}?start=0`,
        };

        const data = await (util.promisify(request.get)(options));

        if (!data.body) {
            console.log(`YELP ERROR while fetching photos main page ${id} : ${data.error.code}`);
        } else {
            const $ = cheerio.load(data.body);
            const count = $('ul[data-media-count]').attr('data-media-count');
            const photosPerPage = $('li[data-photo-id]').length;
            const numberOfPagesToCrawl = Math.ceil(count/photosPerPage);
            let pagesToCrawl = [];
            for (let i = 0; i < numberOfPagesToCrawl; i++) {
                pagesToCrawl.push(`https://www.yelp.com/biz_photos/${encodeURIComponent(id)}?start=${i * photosPerPage}`);
            }

            const imageCalls = pagesToCrawl.map(url => {
               return new Promise(async (resolve) => {
                   const data = await (util.promisify(request.get)({
                       url: url
                   }));

                   const $ = cheerio.load(data.body);
                   const images = $('li[data-photo-id]').map((i, el) => {
                       return el.attribs['data-photo-id'];
                   }).get();

                   resolve(images);
               });
            });

            Promise.all(imageCalls).then(images => {
                let allImages = [];
                images.forEach(arr => {
                    allImages = allImages.concat(...arr);
                });

                photosCache[id] = allImages;
                console.log(`Photo cahce count ${Object.keys(photosCache).length}`);
            });
        }
    },

    getPhotos: (id) => {
        return photosCache[id];
    }
};

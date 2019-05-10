'use strict';

const request = require('request');
const util = require('util');
const appUtils = require('./lacocina-utils');
const cache = {};
const yelpApiKey = 'LHmAorCggtmQbxWdPB-T-4tnh2VGSYkn4zWoMbBiJPFOeAsQqpDGWtbsdhNPJv7bs4yBJ8L8UIyBasdBKkKl5dxVq9MNHUd_zFOXp3jg4vLihxJ3PbKHKa8rwKSDXHYx';
const cacheOutDateTime = 5;

module.exports = {
    cacheOutDateTime: cacheOutDateTime,
    getDataFor: async(id) => {
        if (!id) {
            return {'err': 'id missing'}
        }

        // return is available in cache and less than 5 hrs of cache time
        if (cache[id] && (Math.abs(Date.now() - cache[id].ts) / 36e5) < cacheOutDateTime) {
            return cache[id];
        }

        let retry = 0;
        let callSuccess = false;
        do {
            if (retry > 0) {
                console.log(`Triggering retry for ${id}`);
                await appUtils.sleep(1000);
            }
            const options = {
                url: 'https://api.yelp.com/v3/businesses/{id}',
                headers: {
                    'Authorization': `Bearer ${yelpApiKey}`
                }
            };

            options.url = options.url.replace('{id}', encodeURIComponent(id));
            const data = await (util.promisify(request.get)(options));
            const responseData = JSON.parse(data.body);

            if (responseData.error && responseData.error.code === "TOO_MANY_REQUESTS_PER_SECOND") {
                console.log(`YELP ERROR for ${id} : ${responseData.error.code}`);
            } else {
                callSuccess = true;
                cache[id] = responseData;
                cache[id].ts = Date.now();
            }
        } while (!callSuccess && ++retry < 3);

        return cache[id];
    }
};

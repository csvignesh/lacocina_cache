'use strict';

const request = require('request');
const util = require('util');
const cache = {};
const yelpApiKey = 'LHmAorCggtmQbxWdPB-T-4tnh2VGSYkn4zWoMbBiJPFOeAsQqpDGWtbsdhNPJv7bs4yBJ8L8UIyBasdBKkKl5dxVq9MNHUd_zFOXp3jg4vLihxJ3PbKHKa8rwKSDXHYx';

module.exports = {
    getDataFor: async(id) => {
        if (!id) {
            return {'err': 'id missing'}
        }

        // return is available in cache and less than 5 hrs of cache time
        if (cache[id] && (Math.abs(Date.now() - cache[id].ts) / 36e5) < 5) {
            return cache[id];
        }

        const options = {
            url: 'https://api.yelp.com/v3/businesses/{id}',
            headers: {
                'Authorization': `Bearer ${yelpApiKey}`
            }
        };

        options.url = options.url.replace('{id}', id);

        const data = await (util.promisify(request.get)(options));
        cache[id] = JSON.parse(data.body);
        cache[id].ts = Date.now();
        return cache[id];
    }
};

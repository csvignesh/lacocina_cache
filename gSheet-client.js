'use strict';

const util = require('util');
const {google} = require('googleapis');
const TOKEN = require('./google-cred/token.json');
const CRED = require('./google-cred/credentials.json');

const getAuth = () => {
    const {client_secret, client_id, redirect_uris} = CRED.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    oAuth2Client.setCredentials(TOKEN);
    return oAuth2Client;
};

const parseMultiData = (stringData = "") => {
    return stringData.toLowerCase().split(",").map(e => e.trim().split(" ").join("_"));
};

module.exports = {
    getSheetData: async (id = '1y6JNHNmoZrOzBgH7cnsuJwETzTj4Myq1rnHCjSQiXl4') => {
        const auth = getAuth();
        const sheets = google.sheets({version: 'v4', auth});
        try {
            const response = await (util.promisify(sheets.spreadsheets.values.get.bind(sheets))({
                spreadsheetId: id,
                range: 'A2:F100'
            }));

            if (response.data.values.length) {
                // give out only first column data which is not empty
                return response.data.values.map(e => {
                    return {
                        id: e[0],
                        pinType: (e[1] || "").toLowerCase().trim().split(" ").join("_"),
                        businessType: parseMultiData(e[1]),
                        mealTypes: parseMultiData(e[2]),
                        cuisine: parseMultiData(e[3]),
                        writeUp: e[4],
                        website: e[5]

                    }
                }).filter(e => !!e.id);
            } else {
                console.log('No data found.');
                return [];
            }
        } catch(e) {
            console.error(e);
        }
    }
};

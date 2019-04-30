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

module.exports = {
    getSheetData: async (id = '1y6JNHNmoZrOzBgH7cnsuJwETzTj4Myq1rnHCjSQiXl4') => {
        const auth = getAuth();
        const sheets = google.sheets({version: 'v4', auth});
        const response = await (util.promisify(sheets.spreadsheets.values.get)({
            spreadsheetId: id,
            range: 'A1:B100'
        }));

        if (response.data.values.length) {
            // give out only first column data which is not empty
            return response.data.values.map(e => {
                return {
                    id: e[0],
                    pinType: (e[1] || "").toLowerCase().trim().split(" ").join("_")
                }
            }).filter(e => !!e.id);
        } else {
            console.log('No data found.');
            return [];
        }
    }
};

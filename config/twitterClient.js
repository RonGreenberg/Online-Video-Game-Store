require('dotenv').config(); // loading .env file contents, can be accessed using process.env
const {TwitterApi} = require("twitter-api-v2"); // using the twitter-api-v2 package for Node.js

// connecting to Twitter API with the credentials (read from the .env file)
const client = new TwitterApi({
    appKey: process.env.TWTR_APP_KEY,
    appSecret: process.env.TWTR_APP_SECRET,
    accessToken: process.env.TWTR_ACCESS_TOKEN,
    accessSecret: process.env.TWTR_ACCESS_SECRET
});

const rwClient = client.readWrite; // we need to have writing permissions (posting tweets)

// exporting function to tweet with text only
exports.tweet = async function(text) {
    try {
        /* Tweeting the text. Notes:
         * 1) await keyword means that we don't move on to the next line (and exit the function) before this call finishes.
         * 2) Essential access to the Twitter API allows making requests only to v2 endpoints.
         */
        await rwClient.v2.tweet(text);
    } catch (e) {
        console.error(e); // printing an error if one was encountered
    }
};

// exporting function to tweet text along with an image
exports.tweetWithImage = async function(txt, path) {
    try {
        // uploading the image to Twitter (only v1 endpoints are available for uploading media, to which we can make requests with Essential access)
        const mediaId = await rwClient.v1.uploadMedia('./' + path); // we need to get to the root folder to find public/assets/games_media/images...
        // tweeting the text with the image (mediaId is a string, and media_ids must be an array)
        await rwClient.v2.tweet({ "text": txt, "media": { "media_ids": [mediaId] } });
    } catch (e) {
        console.error(e);
    }
};

const {TwitterApi} = require("twitter-api-v2");
const client = new TwitterApi({
    appKey: "",
    appSecret: "",
    accessToken: "",
    accessSecret: ""
});

const rwClient = client.readWrite;

exports.tweet = async function(text){
    try{
        await rwClient.v2.tweet(text);
    }catch (e){
        console.error(e);
    }
};

exports.tweetWithImage = async function(txt, path){
    try{
        const mediaIds = await rwClient.v1.uploadMedia(path);

        await rwClient.v2.tweet({"text": txt, "media": {"media_ids": [mediaIds]}});
    }catch (e){
        console.error(e);
    }
};
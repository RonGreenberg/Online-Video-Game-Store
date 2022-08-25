# Online-Video-Game-Store
Final project in Web Application Development course at Colman, conducted by Dr. Igor Rochlin.

## Description
"Colman Games" is games shop management tool used by the company to keep track of games, customers and orders - all in just one page.


The website is divided to diffrent sections which we can reach through the sidebar.

![alt text](public/assets/readme_assets/dashboard_showoff.gif)

## Dashboard
In the dashboard section you can monitor information about the server like, OS, CPU, Uptime and number of clients connected - all of those are possible using Socket.io package used [here](public/js//websockets.js).

Moreover, we used D3.js package in order to show different analytics of the store in a nicer way, just like Games-Categories piechart and linechart showing the growth of customers overtime. The code for the followings shown [here](public/js/dashboardCharts.js).

Additionally, you can see in the Dashboard section some new "Gaming" related articles from the past month, brought by News API, and coded [here](public/js/newsApi.js).

## Games
In the games section you can browse between a variety of games available in the shop, search using searching tool or choose between adding a new game, editing one or deleting an old one.

Each row of data provides you the name of the game as well as the image of it, a trailer that will pop up when you click the image and some more inforamtion.

Twitter API - Whenever you'll try to add a new game, an option to post a tweet in [our account](https://twitter.com/AlatzGames) will pop up, thanks to the API we used.
``` js
if (publishOnTwitter) {
    // consturcting the tweet text
    var msg = "New game released!\n" + req.body.gameName + " is now available on " + req.body.platform + " for $" + req.body.unitPrice + ".\nCheck it out!";
    if (req.body.image) {
        // tweeting along with the image of the created game, if it exists
        twitterClient.tweetWithImage(msg, req.body.image);
    } else {
        // otherwise, tweeting just the message
        twitterClient.tweet(msg);
    }
}
```

## Collaborators
- [Ron Greenberg](https://github.com/RonGreenberg)
- [Aviv Keinan](https://github.com/avivk9)
- [Yonatan Birman](https://github.com/yonatan1710)
- [Itamar Azmoni](https://github.com/Itamar-Azmoni)

## Installation Instructions
1. Install [Node.js](https://nodejs.org/en/).
2. Install [MongoDB](https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-6.0.0-signed.msi) and [MongoDB Database Tools](https://fastdl.mongodb.org/tools/db/mongodb-database-tools-windows-x86_64-100.5.4.msi).
3. Add the folders containing the MongoDB and DB Tools executables to Path in the System Environment Variables, e.g.\
C:\Program Files\MongoDB\Server\5.0\bin\
C:\Program Files\MongoDB\Tools\100\bin
4. Create the directory: C:\data\db.
5. Clone this repository.
6. Download [game images](https://drive.google.com/file/d/1Xgkd2fv-94XZhoP3NjyipWN572_taRZi/view?usp=sharing) and extract them to public/assets/games_media/images.
7. Download [game trailers](https://drive.google.com/file/d/1THTEZHK4UCdpJTThD8o_4dOEsGIyCnP2/view?usp=sharing) and extract them to public/assets/games_media/videos.
8. Run the following command in the Online-Video-Game-Store folder, to install all required Node packages listed in [package.json](package.json):
```bash
npm install
```
9. Get a [Twitter API key and tokens](https://developer.twitter.com/en/docs/twitter-api/getting-started/getting-access-to-the-twitter-api).
10. Get a [News API key](https://newsapi.org/register).
11. Create a `.env` file with the following contents in the Online-Video-Game-Store folder and add your keys and tokens within the empty quotes:
```dosini
TWTR_APP_KEY=""
TWTR_APP_SECRET=""
TWTR_ACCESS_TOKEN=""
TWTR_ACCESS_SECRET=""
NEWS_API_KEY=""
```
12. Run [import_data.bat](import_data.bat).
13. Start [run.bat](run.bat).
14. Go to http://localhost:8080 in your browser. You're all set up!
require('dotenv').config(); // loading .env file, containing News API key
const https = require('https'); // built-in https module, enables us to make a GET request to the API

exports.getNews = (req, res) => {
    var apiKey = process.env.NEWS_API_KEY;

    var date = new Date();
    date.setMonth(date.getMonth() - 1); // retrieving news starting from one month ago

    // options for the https request
    var options = {
        hostname: 'newsapi.org',
        // specifying "gaming" in the query, taking only English articles and sorting by newest
        path: '/v2/everything?q=gaming&from=' + date.toISOString().split('T')[0] + '&sortBy=publishedAt&language=en&apiKey=' + apiKey,
        headers: { 'User-Agent': 'Mozilla/5.0' } // required
    };

    https.get(options, function(response) {
        var json = '';

        // every time a chunk of data is received, appending it to the string
        response.on('data', function(chunk) {
            json += chunk;
        });

        // when the whole response has been received, sending it back (as an object) to the client who requested getNews
        response.on('end', function() {
            res.send(JSON.parse(json));
        });
    });
}

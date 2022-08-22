function retrieve() {
    const apiKey = config.NEWS_API_KEY;

    var date = new Date();
    date.setMonth(date.getMonth() - 1); // retrieving news starting from one month ago
    // specifying "gaming" in the query, taking only English articles and sorting by newest
    var url = 'https://newsapi.org/v2/everything?q=gaming&from=' + date.toISOString().split('T')[0] + '&sortBy=publishedAt&language=en&apiKey=' + apiKey;
    
    // sending the AJAX GET request
    $.get(url, function(data) {
        const newsList = $('.news-list'); // element in which we put the links to the articles

        var articles = data.articles;
        for (var i = 0; i < Math.min(articles.length, 100); i++) { // limiting to 25 articles
            var publishingDate = articles[i].publishedAt.split('T')[0]; // converting from ISO format
            // adding a list item with a link to the article (opens in new tab)
            newsList.append('<li>[' + publishingDate + '] <a href="' + articles[i].url + '" target="_blank">' + articles[i].title + '</a></li>');
        }
    });
}

retrieve(); // calling the function once

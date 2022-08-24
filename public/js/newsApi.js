function retrieve() {
    // sending the GET request to the dedicated route on the server
    $.get('getNews', function(data) {
        const newsList = $('.news-list'); // element in which we put the links to the articles
        var articles = data.articles;
        for (var i = 0; i < Math.min(articles.length, 100); i++) { // limiting to 100 articles
            var publishingDate = articles[i].publishedAt.split('T')[0]; // converting from ISO format
            // adding a list item with a link to the article (opens in new tab)
            newsList.append('<li>[' + publishingDate + '] <a href="' + articles[i].url + '" target="_blank">' + articles[i].title + '</a></li>');
        }
    });
}

retrieve(); // calling the function once

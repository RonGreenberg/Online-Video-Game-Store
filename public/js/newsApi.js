function retrieve(){
    const apiKey = "203e6ef0c1154967a6dae680bca5f1cf";
    var date = new Date();
    date.setMonth(date.getMonth() - 1);
    let url = 'https://newsapi.org/v2/everything?q=gaming&from=' + date.toISOString().split('T')[0] + '&apiKey=' + apiKey;
    
    $.get(url, function(data){
        const newsList = $('.news-list');

        console.log(data);
        let articles = data.articles;
        let news = [];
        for(let i = 0; i < Math.min(articles.length, 25); i++){
            newsList.append('<li><a href="' + articles[i].url + '">' + articles[i].title + '</a></li>');
        }
        console.log(news);
        return news;
    })
}
retrieve();
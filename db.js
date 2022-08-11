const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";
const dbName = "online-video-game-store";

var dbConnection;

module.exports =  {
    connectToDb: function(callback) {
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;

            dbConnection = db.db(dbName);
            console.log("Successfully connected to MongoDB.");
            callback(dbConnection); // the only way to pass the created connection out of this scope is using a callback
        });
    }
};

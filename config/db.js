const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";
const dbName = "online-video-game-store";

var dbConnection;

// this function creates a unique index (to serve as a "primary key") in the database, if it doesn't already exist
function createUniqueIndex(dbo, collection, fieldName, callback) {
    var indexSpec = new Object();
    indexSpec[fieldName] = 1; // creates { fieldName: 1 }
    dbo.collection(collection).createIndex(indexSpec, { unique: true }, function(err, result) {
        if (err) throw err;
        console.log("Created index: " + result);
        if (callback) {
            callback();
        }
    });
}

module.exports =  {
    connectToDb: function(callback) {
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;

            dbConnection = db.db(dbName);
            console.log("Successfully connected to MongoDB.");

            // after connecting, create unique indexes for all relevant collections, one after the other
            createUniqueIndex(dbConnection, "customers", "customerID", function() {
                createUniqueIndex(dbConnection, "games", "gameID", function() {
                    createUniqueIndex(dbConnection, "orders", "orderNumber", function() {
                        callback(); // executing the passed callback function (which in our case, starts the server) only after completing the process
                    });
                });
            });
        });
    },

    // exporting a function to get the db connection object
    getDb: function() {
        return dbConnection;
    }
};

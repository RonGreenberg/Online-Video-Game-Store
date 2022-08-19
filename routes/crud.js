const mongoDb = require('../db'); // db.js
const ObjectId = require('mongodb').ObjectId; // we must use ObjectId to filter by _id
const twitterClient = require("../twitterClient.js");

// connecting to the database and storing the connection object
var dbo;
mongoDb.connectToDb(function(dbConnection) {
    dbo = dbConnection;
});

// exporting CRUD functions

exports.read = (req, res) => {
    // returning all records from the collection given in the URL parameter
    dbo.collection(req.query.collection).find().toArray(function(err, result) {
        if (err) throw err;
        res.send(result);
    });
};

exports.create = (req, res) => {
    // thanks to the body-parser module, we can access req.body which contains a plain object that we can immediately pass to insertOne()
    dbo.collection(req.query.collection).insertOne(req.body, function(err, result) {
        if (err) throw err;
        res.send("1 document inserted"); // we must send some response, otherwise the page would not load
        if(req.query.collection == "games")
        {
            var msg = "New Game released! \n" + req.body.gameName + " is now available on " + req.body.platform + ".\nCheck it out!";
            if(req.body.image)
                twitterClient.tweetWithImage(msg, req.body.image);
            else
                twitterClient.tweet(msg);
        }
    });
};

exports.update = (req, res) => {
    // in addition to the collection, the id of the document to be updated is also passed as URL parameter, while the contents are passed in the POST request body
    dbo.collection(req.query.collection).updateOne({_id: ObjectId(req.query.id)}, {$set: req.body}, function(err, result) {
        if (err) throw err;
        res.send("1 document updated");
    });
};

exports.delete = (req, res) => {
    // deleting the document with the id passed in the POST request body
    dbo.collection(req.query.collection).deleteOne({_id: ObjectId(req.body.id)}, function(err, result) {
        if (err) throw err;
        res.send("1 document deleted");
    });
};

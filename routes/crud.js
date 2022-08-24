const mongoDb = require('../config/db'); // db.js
const ObjectId = require('mongodb').ObjectId; // we must use ObjectId to filter by _id
const twitterClient = require("../config/twitterClient.js");

// getting the db connection object (possible since this file is required and loaded only when the connection is ready)
var dbo = mongoDb.getDb();

// exporting CRUD functions

exports.read = (req, res, next) => {
    // for orders collection, read needs to return a special response, so we call the next middleware
    if (req.query.collection == "orders") {
        return next();
    }

    // getting indexes for the collection given in the URL parameter, that we'll use to sort the results
    dbo.collection(req.query.collection).indexes(function(err, indexes) {
        if (err) throw err;

        var index = {};
        if (indexes[1]) { // checking if there is an index besides _id (not in the case of developers collection)
            index = indexes[1].key; // the key property contains { "indexName": 1 }, which sorts the documents in ascending order of that field
        }

        // returning all records from the collection given in the URL parameter, sorted using the index (primary key)
        dbo.collection(req.query.collection).find().sort(index).toArray(function(err, result) {
            if (err) throw err;
            res.send(result);
        });  
    })
};

exports.create = (req, res) => {
    /* Thanks to the body-parser module, we can access req.body which contains a plain object that is structured in the exact format we need to pass to
     * MongoDB in insertOne(). But there is a little thing to do first. This is called a destructuring assignment - if req.body contains a field named
     * publishOnTwitter (in the case of games), it is stored in a variable of the same name and the rest of the object, without this field, is stored
     * in the body variable. This is because in Games we have a form parameter indicating whether to publish the game on twitter, but it should not be
     * part of the object saved in MongoDB. For other pages, since the request doesn't contain publishOnTwitter anyway, req.body is copied to body as is.
     */
    const { publishOnTwitter, ...body } = req.body;

    /* In the case of creating a new order, we have to append an empty games array or otherwise the order will be filtered by orders.read, thus not
     * appearing in the page at all. Also, MongoDB doesn't accept an empty array without null.
     */
    if (req.query.collection == "orders") {
        body.games = [null];
    }

    dbo.collection(req.query.collection).insertOne(body, function(err, result) {
        if (err) {
            // catching the error: "MongoServerError: E11000 duplicate key error collection"
            if (err.name == 'MongoServerError' && err.code == 11000) {
                return res.status(422).send("Error: Duplicate primary key. Try again."); // sending an error message along with a status code
            }
            throw err; // if it's another error, throw it
        }

        res.send("1 document inserted"); // we must send some response, otherwise the page would not load
        
        // publishing the game on Twitter (publishOnTwitter is undefined if it's not the games collection or the checkbox in games form wasn't checked)
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

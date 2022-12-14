const ObjectId = require('mongodb').ObjectId;
const Double = require('mongodb').Double; // mongodb native Double type
var dbo = require('../config/db').getDb();

// exporting a read middleware function
exports.read = (req, res) => {
    /* Orders are stored in the database like this:
       { 
        "_id" : ObjectId("62fa526f23797019c0194839"), 
        "orderNumber" : "1", 
        "customerID" : "043258734", 
        "paymentMethod" : "PayPal", 
        "orderDate" : ISODate("2022-08-15T00:00:00.000+0000"), 
        "games" : [
            {
                "gameID" : "APK-FRTNT", 
                "numberOfUnits" : 2.0
            }
        ]
       }
       
       The following query returns all orders while adding the gameName and unitPrice fields to each object in the games array,
       so that we can use them in the Orders page. Of course, they are taken from the games collection.
    */
    dbo.collection("orders").aggregate([ // each element in the array is a different stage in the aggregation
        {
          // deconstructing games array field, returning a separate document for each object in the array, added to the rest of the order fields
          $unwind: "$games"
        },
        {
          // $lookup allows joining the orders collection and the games collection, using the gameID field
          "$lookup": {
            "from": "games",
            "localField": "games.gameID",
            "foreignField": "gameID",
            "as": "gamesB" // temporarily renames the field to gamesB, with each object now containing all fields from games collection
          }
        },
        {
          $project: { // $project allows us to select only specific fields for the result
            // including the main fields from orders, of course
            _id: 1,
            orderNumber: 1,
            customerID: 1,
            paymentMethod: 1,
            orderDate: 1,
            // including a games object containing the gameID, the gameName and unitPrice returned from the $lookup, and the number of units
            games: {
              gameID: "$games.gameID",
              gameName: {
                $first: "$gamesB.gameName"
              },
              numberOfUnits: "$games.numberOfUnits",
              unitPrice: {
                $first: "$gamesB.unitPrice"
              }
            }
          }
        },
        {
          $group: { // grouping the documents by the order _id and generating the required fields for the resulting documents
            _id: "$_id",
            orderNumber: {
              $first: "$orderNumber"
            },
            customerID: {
              $first: "$customerID"
            },
            paymentMethod: {
              $first: "$paymentMethod"
            },
            orderDate: {
              $first: "$orderDate"
            },
            games: {
              $push: "$games" // returning the games array as the "games" field
            }
          }
        }
    ]).sort({ orderNumber: 1 }).toArray(function(err, result) { // sorting by orderNumber in ascending order and returning the result as an array
        if (err) throw err;

        // in case an orderID was given in the URL parameters, returning only the order with that specific id
        if (req.query.orderID) {
            res.send(result.find(order => order['_id'].equals(ObjectId(req.query.orderID))));
        } else {
            res.send(result); // else, returning all orders
        }
    });
};

exports.addItem = (req, res, next) => {
    // if the action is delete, we proceed to the next middleware (deleteItem)
    if (req.query.action == 'delete') {
        return next();
    }

    // assuming req.body.action='add' at this point

    req.body.numberOfUnits = Double(req.body.numberOfUnits); // converting the number of units to mongodb Double type (because it's received as a string)
    
    // in case we add an item to an empty order, which contains null in the games array, we have to remove it first
    dbo.collection("orders").updateOne({ _id: ObjectId(req.query.orderID), "games": [null] },
    { $set: { "games": [] } }, function(err, result) {
        if (err) throw err;

        // updating the games array of the given order with the new item
        dbo.collection("orders").updateOne({ _id: ObjectId(req.query.orderID) }, { $push: { "games": req.body }}, function(err, result) {
            if (err) throw err;
            res.send("1 item added");
        });
    });
};

exports.deleteItem = (req, res) => {
    // deleting the item from the games array of the specified order
    dbo.collection("orders").updateOne({ _id: ObjectId(req.query.orderID), "games.gameID": req.body.gameID },
     { $pull: { "games": { "gameID": req.body.gameID } } }, function(err, result) {
        if (err) throw err;
        res.send("1 item deleted");

        // in case we have just deleted the last item, emptying the games array, we must push a null value so that the order doesn't get filtered by read
        dbo.collection("orders").updateOne({ _id: ObjectId(req.query.orderID), "games": [] },
        { $push: { "games": null } }, function(err, result) {
            if (err) throw err;
        });
    });
};

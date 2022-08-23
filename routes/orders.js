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
        res.send(result);
    });
};

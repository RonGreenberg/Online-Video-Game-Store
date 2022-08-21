var dbo = require('../config/db').getDb(); // getting the db connection object (possible since this file is required and loaded only when the connection is ready)

exports.rg = (req, res) => {
    // array that will store game recommendations for all customers
    var recommendations = [];

    // getting all customers
    dbo.collection("customers").find().toArray(function(err, customers) {
        if (err) throw err;

        // getting all orders
        dbo.collection("orders").find().toArray(function(err, orders) {
            if (err) throw err;

            // getting all games
            dbo.collection("games").find().toArray(function(err, games) {
                if (err) throw err;

                // calculating a recommendation for each customer
                for (var i = 0; i < customers.length; i++) {
                    var chosenGame; // variable to store the chosen game object

                    // filtering orders purchased by the current customer
                    var customerOrders = orders.filter(order => order.customerID == customers[i].customerID);
                    if (customerOrders.length == 0) { // if this customer never ordered anything, we recommend a random game
                        chosenGame = randElement(games);
                    } else {
                        // storing all games purchased by this customer in a map, for better performance (O(1) lookup)
                        var allPurchasedGames = new Map();
                        for (var order of customerOrders) {
                            for (var purchasedGame of order.games) {
                                // mapping from game IDs to full game objects (taken from the games array, identified using the ID)
                                allPurchasedGames.set(purchasedGame.gameID, games.find(game => game.gameID == purchasedGame.gameID));
                            }
                        }

                        // filtering the games that we can possibly recommend to the customer - those that they never purchased
                        var possibleGames = games.filter(game => !allPurchasedGames.has(game.gameID));

                        // if there are no possible games, it means that the customer has ordered all games, so we have nothing to recommend. chosenGame remains undefined
                        if (possibleGames.length > 0) {

                            /* In each step, we run over all the games the customer has purchased. For each one, we are trying to find a game
                             * that the customer has not purchased, and satisfies a given criteria. If we don't find one, we try a weaker criteria
                             * in the next step and run over the purchased games again.
                             */

                            // trying to find a game with the same genre and platform that the customer hasn't purchased
                            chosenGame = findGameByCriteria(allPurchasedGames.values(), possibleGames, function(game1, game2) {
                                return game1.genre == game2.genre && game1.platform == game2.platform;
                            });
                            if (!chosenGame) {
                                // trying to find a game with the same platform only
                                chosenGame = findGameByCriteria(allPurchasedGames.values(), possibleGames, function(game1, game2) {
                                    return game1.platform == game2.platform;
                                });
                                if (!chosenGame) {
                                    // trying to find a game with the same genre only
                                    chosenGame = findGameByCriteria(allPurchasedGames.values(), possibleGames, function(game1, game2) {
                                        return game1.genre == game2.genre;
                                    });
                                    // if we didn't find a match until now, we pick a random game that the customer hasn't purchased
                                    if (!chosenGame) {
                                        chosenGame = randElement(possibleGames);
                                    }
                                }
                            }
                        }
                    }

                    // addding the recommendation object to the array
                    recommendations.push({ customerID: customers[i].customerID, recommendedGame: chosenGame });
                }

                res.send(recommendations); // sending the array back to the client
            });
        });
    });
};

/* This function receives an array of game objects that the current customer purchased, an array of possible games we can choose, and a criteria -
 * a function that receives two games, compares them in some way and returns a boolean value. The function returns a game among the possible
 * games if it matches the criteria against one of the purchased games, or undefined if no match was found.
 */
function findGameByCriteria(allPurchasedGames, possibleGames, criteria) {
    var chosenGame;

    for (var purchasedGame of allPurchasedGames) {
        chosenGame = possibleGames.find(game => criteria(game, purchasedGame)); // trying to find a possible game that satisfies the criteria
        if (chosenGame) { // as soon as we find one, returning it
            return chosenGame;
        }
    }
    return chosenGame; // returns undefined if we got here
}

// this function returns a random element from a given array
function randElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

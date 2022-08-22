var dbo = require('../config/db').getDb(); // getting the db connection object (possible since this file is required and loaded only when the connection is ready)

exports.statistics = (req, res) => {
    if (req.query.data == 'gamesByPlatform') {
        // GROUP BY query in MongoDB. receiving the number of games for each platform
        dbo.collection("games").aggregate([{ $group: { _id: "$platform", count: { $sum: 1 } } }]).toArray(function(err, result) {
            if (err) throw err;

            var mappings = {
                'Mobile': ['Android', 'IOS'],
                'PC': ['macOS', 'Microsoft Windows'],
                'Nintendo': ['Nintendo Switch', 'Nintendo-DS', 'Wii', 'Wii-U'],
                'PlayStation': ['PS3', 'PS4', 'PSP'],
                'Xbox': ['Xbox-360', 'Xbox-One'],
                'Other': ['Other...']
            };

            // generating the map: [ {'Mobile': 0}, {'PC': 0}, ... ]
            var finalGroups = new Map();
            for (var group in mappings) { // iterating over the object's properties, which are the group names
                finalGroups.set(group, 0);
            }

            for (var groupCounts of result) { // iterating over the objects: [{"_id":"Android","count":4},{"_id":"Nintendo Switch","count":2}, ...]
                var platform = groupCounts['_id'];
                // searching for the group that contains the current platform 
                for (var group in mappings) {
                    if (mappings[group].includes(platform)) {
                        finalGroups.set(group, finalGroups.get(group) + groupCounts['count']); // adding the count from this platform to the overall group count
                        break;
                    }
                }
            }
            
            // Object.fromEntries() transforms a list of key-value pairs into an object
            res.send(Object.fromEntries(finalGroups));
        });
    } else {
        res.sendStatus(404); // sending Not Found, because the only statistic that we provide is gamesByPlatform
    }
};

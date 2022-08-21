const express = require('express');
const app = express();
const socket = require('socket.io');
const os = require('os'); // provides operating system-related utility methods, used to send info about the server to clients
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

const crud = require('./routes/crud'); // crud.js
const gamesMedia = require('./routes/gamesMedia'); // gamesMedia.js

// serving static files
app.use(express.static(__dirname));

// enables parsing of application/x-www-form-urlencoded data received in a post request, meaning data formatted like: MyVariableOne=ValueOne&MyVariableTwo=ValueTwo... (practically only used for delete)
app.use(bodyParser.urlencoded({extended: false}));

// using the express-fileupload module that can handle <input type="file"> elements as part of multipart/form-data requests
app.use(fileUpload());

// assigning functions exported from crud.js to designated routes
app.get('/read', crud.read);

/* We can pass multiple functions, called middlewares, to get/post handlers. Each of these functions has access to req, res and the next middleware
 * function in the application's request-response cycle. Each function can decide when to call the next one. In our case, we need to provide support
 * for image/video upload as part of create/update requests, because we have images and trailers in the Games page. The database should store the
 * paths of those media files, so we first run a middleware function that checks if the request contains uploaded files. If it doesn't, we continue to
 * crud.create as usual. Otherwise, we store the files on designated folders on the server, add their paths to the request body and then proceed to store
 * the record in the database.
 */
app.post('/create', gamesMedia.upload, crud.create);
app.post('/update', gamesMedia.upload, crud.update);
app.post('/delete', crud.delete);

// listen() returns the created HTTP server
const server = app.listen(8080, () => {
    console.log('server listening on port 8080');
});

// socket setup
const io = socket(server);

/* Defining a route that upon receiving a GET request, sends a notification to all connected clients to refresh their pages, due to updates made on the
 * server. In the helpers folder we have two batchfiles that perform a change in the server files (specifically, overwrite the file of the banner image),
 * then immediately send a GET request to this route using the wget utility.
 */
app.get('/serverUpdate', function(req, res) {
    io.emit('refresh_page');
    res.send('Successfully notified about change');
});

// listens for incoming new socket connections
io.on('connection', function(socket) {
    io.emit('update_info', getInfo()); // sending information about the server to all clients, thus updating the client count (calling a function so that the info is up-to-date)
    socket.on('disconnect', function() {
        io.emit('update_info', getInfo()); // doing the same thing whenever this client (or any other one) disconnects
    });
});

// this function returns an object containing info about the server OS, CPU, Uptime and number of currently connected clients
function getInfo() {
    return { osType: os.type(), cpu: os.cpus()[0].model, uptime: os.uptime(), clientsCount: io.engine.clientsCount };
}

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const crud = require('./routes/crud'); // crud.js
const gamesMedia = require('./routes/gamesMedia'); // gamesMedia.js

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

app.listen(8080, () => {
    console.log('server listening on port 8080');
});

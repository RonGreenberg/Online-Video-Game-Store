const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const crud = require('./routes/crud'); // crud.js

app.use(express.static(__dirname));

// enables parsing of application/x-www-form-urlencoded data received in a post request, meaning data formatted like: MyVariableOne=ValueOne&MyVariableTwo=ValueTwo...
app.use(bodyParser.urlencoded({extended: false}));

app.use(fileUpload());

// assigning functions exported from crud.js to designated routes
app.get('/read', crud.read);
app.post('/create', crud.create);
app.post('/update', (req, res) => {
    if (!req.files) {
        console.log('no files');
    } else {
        console.log(req.files);
    }
    crud.update(req, res);
});
app.post('/delete', crud.delete);

app.listen(8080, () => {
    console.log('server listening on port 8080');
});

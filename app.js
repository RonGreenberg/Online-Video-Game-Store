const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const crud = require('./routes/crud'); // crud.js

// app.use(express.static(__dirname, {index: false}));
app.use(express.static(__dirname));

// enables parsing of application/x-www-form-urlencoded data received in a post request, meaning data formatted like: MyVariableOne=ValueOne&MyVariableTwo=ValueTwo...
app.use(bodyParser.urlencoded({extended: false}));

// assigning functions exported from crud.js to designated routes
app.get('/read', crud.read);
app.post('/create', crud.create);
app.post('/update', crud.update);
app.post('/delete', crud.delete);

app.listen(8080, () => {
    console.log('server listening on port 8080');
});

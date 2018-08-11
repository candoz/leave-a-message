const express = require('express');
const path = require('path');
const serveStatic = require('serve-static');
const bodyParser = require('body-parser');
const session = require('express-session');

let app = express();

app.use(serveStatic(__dirname + "/dist"));

app.use(session({
    secret: 'work hard',
    resave: true,
    saveUninitialized: false
}));

app.use(bodyParser.urlencoded({ extended: true }));//TODO cercare cosa significa extended
app.use(bodyParser.json());

let routes = require('./routes/routes');
app.use(routes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log('Listening on port ' + port)
});

// Error handling with Express (and Boom)
app.use((err, req, res, next) => {
    if (err.isServer) {
        console.log(err);
    }
    return res.status(err.output.statusCode).json(err.output.payload);
});

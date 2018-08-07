const express = require('express');
const path = require('path');
const serveStatic = require('serve-static');

let app = express();
app.use(serveStatic(__dirname + "/dist"));

let dbRoutes = require('./routes/dbRoutes');
app.use('/db', dbRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log('Listening on port ' + port)
});




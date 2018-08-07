const MongoClient = require('mongodb').MongoClient;
const url = process.env.MONGODB_URI || "mongodb://heroku_sh9pbrkt:8u0np9l4apmmp6ur55t1o588p0@ds113452.mlab.com:13452/heroku_sh9pbrkt";

let dbPoolConnection;
MongoClient.connect(url, {poolSize:10} ,function(err, db) {
  if (err) throw err;
  dbPoolConnection = db.db("heroku_sh9pbrkt");

  //test
    dbPoolConnection.collection("Comments").find({}).toArray(function(err, result) {
        if (err) throw err;
        console.log(result);
        db.close();
    });
});

module.exports = (function() {
    'use strict';

    let dbRoutes = require('express').Router();

    dbRoutes.get('/', function (req, res) {
        res.send('Hello db routes!');
    });

    return dbRoutes;
})();

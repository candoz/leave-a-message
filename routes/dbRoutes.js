const MongoClient = require('mongodb').MongoClient;
const url = process.env.MONGODB_URI || "mongodb://heroku_sh9pbrkt:8u0np9l4apmmp6ur55t1o588p0@ds113452.mlab.com:13452/heroku_sh9pbrkt";
const bcrypt = require('bcrypt');
const saltRounds = 10;

let dbPoolConnection;
MongoClient.connect(url, {poolSize:10, useNewUrlParser: true} , function(err, db) {
  if (err) throw err;
  dbPoolConnection = db.db(db.s.options.dbName);
});

module.exports = (function() {
    'use strict';

    let dbRoutes = require('express').Router();

    dbRoutes.post('/users', function (req, res) { 
        if(req.body.email && req.body.password && req.body.nickname) {
            bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
                if(err) console.log(err);
                let userData = {
                    email: req.body.email,
                    nickname: req.body.nickname,
                    password: hash
                }
                
                dbPoolConnection.collection("Users").insertOne(userData, function(err, dbRes) {
                    if (err) {res.send(err);throw err;}
                    res.send(dbRes);
                });
                console.log("Registered new user: ");
                for (var property in userData){
                    console.log(property + " > " + userData[property]);
                }
                req.session.userId=userData["_id"];
            });
        } else {
            res.status(400).send("Empty Fields");
        }
    });

    dbRoutes.get("/login", function(req, res) {
        if(req.headers.email && req.headers.password) {
            dbPoolConnection.collection("Users").findOne({email : req.headers.email}, function(err, dbResult) {
                if (err) {res.send(err);throw err;}
                bcrypt.compare(req.headers.password, dbResult["password"], function(err, cryptResult) {
                    if (cryptResult === true) {
                        req.session.userId=dbResult["_id"];
                        res.send("Ok");
                      } else {
                        res.send("Wrong password");
                      }
                });
            });
        } else {
            res.status(400).send("Empty Fields");
        }
    });

    return dbRoutes;
})();

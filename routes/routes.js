const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const bcrypt = require("bcrypt");
const boom = require('boom');

const URL = process.env.MONGODB_URI || "mongodb://heroku_sh9pbrkt:8u0np9l4apmmp6ur55t1o588p0@ds113452.mlab.com:13452/heroku_sh9pbrkt";
const SALT_ROUNDS = 10;
const MAX_DISTANCE_FULL_MESSAGES = 500; // 500 meters radius
const MAX_DISTANCE_LIMITED_MESSAGES = 10000; // 10 Km radius
const HASHTAG_REGEX = /(#[a-zA-Z\d]+)/g;
const LOG_CLIENT_ERRORS = true;
const LOG_SERVER_EVENTS = true;

let dbPoolConnection;
MongoClient.connect(URL, { poolSize: 10, useNewUrlParser: true }, function (err, db) {
    if (err) throw err;
    dbPoolConnection = db.db(db.s.options.dbName);  // TODO: alternative to "db.db.db..." ???
});

module.exports = (function () {

    "use strict";
    let dbRoutes = require("express").Router();

    dbRoutes.post("/users", function (req, res, next) {
        if (req.body.email && req.body.password && req.body.nickname) {
            bcrypt.hash(req.body.password, SALT_ROUNDS, function (err, hash) {
                if (err) { return next(err); }
                let newUserData = {
                    "email": req.body.email,
                    "nickname": req.body.nickname,
                    "password": hash,
                    "position": {
                        "type": "Point",
                        "coordinates": [
                            Number(req.body.lng),
                            Number(req.body.lat)
                        ]
                    }
                }
                dbPoolConnection.collection("Users").insertOne(newUserData, function (err, dbResNewUser) {
                    if (err) { return next(err); }
                    req.session.userId = dbResNewUser._id;
                    res.send(dbResNewUser);

                    if (LOG_SERVER_EVENTS) {
                        console.log("New user successfully registered:");
                        for (const property in dbResNewUser) {
                            console.log(property + " > " + dbResNewUser[property]);
                        }
                    }
                });
            });
        } else {
            res.status(400).send("Empty Fields");
            console.log("New user registration failed: email, password or nickname not specified!\n");
        }
    });

    dbRoutes.post("/login", function (req, res, next) {
        if (!req.body.email || !req.body.password) {
            if (LOG_CLIENT_ERRORS) { console.log("User tried to login without specifying both email and password"); }
            return next(boom.badRequest("Missing email and/or password"));
        }
        dbPoolConnection.collection("Users").findOne({ "email": req.body.email }, function (err, dbResUserWithThatEmail) {
            if (err) { return next(boom.badImplementation(err)); }
            if (!dbResUserWithThatEmail) {
                if (LOG_CLIENT_ERRORS) { console.log("User tried to login with a non-registered email: " + req.body.email); }
                return next(boom.badRequest("Email not registered"));
            }
            bcrypt.compare(req.body.password, dbResUserWithThatEmail.password, function (err, cryptResult) {
                if (err) { return next(boom.badRequest(err)); }
                if (cryptResult !== true) {
                    if (LOG_CLIENT_ERRORS) { console.log("User " + dbResUserWithThatEmail.email + " failed trying to login. Wrong password"); }
                    return next(boom.unauthorized("Wrong password"));
                }
                req.session.userId = dbResUserWithThatEmail._id;
                if (req.body.lng && req.body.lat) {
                    const toUpdate = {
                        $set: {
                            "location": {
                                "type": "Point",
                                "coordinates": [
                                    Number(req.body.lng),
                                    Number(req.body.lat)
                                ]
                            }
                        }
                    };
                    dbPoolConnection.collection("Users")
                        .updateOne({ "email": req.body.email }, toUpdate, function (err, dbResUserWithUpdatedLocation) {
                            if (err) { return next(boom.badImplementation(err)); }
                            res.send("Logged-in as " + req.body.email + " located in (lng:" + req.body.lng + ",lat:" + req.body.lat + ")");
                            if (LOG_SERVER_EVENTS) {
                                console.log("User " + req.body.email + " logged-in updating his/her location:");
                                console.log("-> Lng: " + req.body.lng);
                                console.log("-> Lat: " + req.body.lat);
                            }
                        });
                } else {
                    res.send("Logged-in as " + req.body.email);
                    if (LOG_SERVER_EVENTS) { console.log("User " + dbResUserWithThatEmail.email + " logged-in"); }
                }
            });
        });
    });

    dbRoutes.post("/logout", function (req, res, next) {
        const userId = req.session.userId;  // so it can be used in server log also after its destruction
        if (userId == null) {
            if (LOG_CLIENT_ERRORS) { console.log("Someone not logged-in tried to logout"); }
            return next(boom.badRequest("Cannot logout if not logged-in"));
        }
        req.session.destroy(function (err) {
            if (err) { return next(boom.badImplementation(err)); }
            if (LOG_SERVER_EVENTS) { console.log("User with session id " + userId + " logged-out"); }
            res.send("Logged-out");
        });
    });

    dbRoutes.post("/messages", function (req, res, next) {
        if (req.session.userId == null) {
            if (LOG_CLIENT_ERRORS) { console.log("Someone not logged-in tried to post a message"); }
            return next(boom.badRequest("Cannot post a message if not logged-in"));
        }
        let messageData = {
            author_id: req.session.userId,
            text: req.body.text,
        }
        if (HASHTAG_REGEX.test(req.body.text)) {
            messageData.hashtags = [...new Set(req.body.text.match(HASHTAG_REGEX).map(val => val.split("#")[1]))];  // Set to remove duplicates!
        } else {
            messageData.hashtags = [];
        }

        dbPoolConnection.collection("Users").findOne(new ObjectId(req.session.userId), function (err, dbResLoggedUser) {
            if (err) { return next(boom.badImplementation(err)); }
            messageData.location = dbResLoggedUser.location;
            dbPoolConnection.collection("Messages").insertOne(messageData, function (err, dbResPublishedMessage) {
                if (err) { return next(boom.badImplementation(err)); }
                res.send("Message succesfully published");
                if (LOG_SERVER_EVENTS) { console.log("A new message has been published by user " + req.session.userId); }
            });
        });
    });

    dbRoutes.get("/messages/full", function (req, res, next) {
        if (loginCheck(req, res)) {
            dbPoolConnection.collection("Users").findOne(new ObjectId(req.session.userId), function (err, dbResLoggedUser) {
                if (err) {
                    res.send(err);
                    console.log(err);
                }
                dbPoolConnection.collection("Messages")
                    .find({
                        "location": {
                            $near: {
                                $geometry: dbResLoggedUser.location,
                                $maxDistance: MAX_DISTANCE_FULL_MESSAGES
                            }
                        }
                    })
                    .toArray(function (err, dbResMessagesFull) {
                        if (err) {
                            res.send(err);
                            console.log(err);
                        }
                        res.send(dbResMessagesFull);
                        console.log("Sent " + dbResMessagesFull.length + " full message/s near user " + dbResLoggedUser.email);
                    });
            });
        }
    });

    dbRoutes.get("/messages/limited", function (req, res, next) {
        dbPoolConnection.collection("Messages")
            .find({
                "location": {
                    $near: {
                        $geometry: {
                            "type": "Point",
                            "coordinates": [
                                Number(req.query.lng),
                                Number(req.query.lat)
                            ]
                        },
                        $maxDistance: MAX_DISTANCE_LIMITED_MESSAGES
                    }
                }
            })
            .toArray(function (err, dbResMessagesLimited) {
                if (err) {
                    res.send(err);
                    console.log(err);
                }
                dbResMessagesLimited.forEach(function (val) {
                    delete val.author_id;  // TODO: si può anche costruire direttamente un nuovo oggetto
                    delete val.text;       //       solamente con i campi che sono necessari.
                    delete val.comments_id;
                });
                res.send(dbResMessagesLimited);
                console.log("Sent " + dbResMessagesLimited.length + " limited messages near (lng:" + req.query.lng + ",lat:" + req.query.lat + ")");
            });
    });

    // dbRoutes.get("/testSession", function(req, res, next) {
    //     console.log(req.session.userId);
    // });

    return dbRoutes;
})();

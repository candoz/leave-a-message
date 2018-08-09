const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const url = process.env.MONGODB_URI || "mongodb://heroku_sh9pbrkt:8u0np9l4apmmp6ur55t1o588p0@ds113452.mlab.com:13452/heroku_sh9pbrkt";
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;
const MAX_DISTANCE_FULL_MESSAGES = 500; // 500 meters radius
const MAX_DISTANCE_LIMITED_MESSAGES = 10000; // 10 Km radius
const HASHTAG_REGEX = /(#[a-zA-Z\d]+)/g;

let dbPoolConnection;
MongoClient.connect(url, { poolSize: 10, useNewUrlParser: true }, function (err, db) {
    if (err) throw err;
    dbPoolConnection = db.db(db.s.options.dbName);  // TODO: alternative to "db.db.db..." ???
});

module.exports = (function () {

    "use strict";
    let dbRoutes = require("express").Router();

    dbRoutes.post("/users", function (req, res, next) {
        if (req.body.email && req.body.password && req.body.nickname) {
            bcrypt.hash(req.body.password, SALT_ROUNDS, function (err, hash) {
                if (err) {
                    console.log(err);
                    next(err);
                }
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
                    if (err) {
                        console.log(err);
                        next(err);
                    }
                    req.session.userId = dbResNewUser._id;
                    res.send(dbResNewUser);
                    console.log("New user successfully registered:");
                    for (const property in dbResNewUser) {
                        console.log(property + " > " + dbResNewUser[property]);
                    }
                });
            });
        } else {
            res.status(400).send("Empty Fields");
            console.log("New user registration failed: email, password or nickname not specified!\n");
        }
    });

    dbRoutes.post("/login", function (req, res, next) {
        if (req.body.email && req.body.password) {
            dbPoolConnection.collection("Users").findOne({ "email": req.body.email }, function (err, dbResUserWithThatEmail) {
                if (err) {
                    res.send(err);
                    console.log(err);
                }
                if (dbResUserWithThatEmail) {
                    bcrypt.compare(req.body.password, dbResUserWithThatEmail.password, function (err, cryptResult) {
                        if (cryptResult === true) {
                            req.session.userId = dbResUserWithThatEmail._id;
                            if (req.body.lat && req.body.long) {
                                const newLocation = {
                                    "type": "Point",
                                    "coordinates": [
                                        Number(req.body.lng),
                                        Number(req.body.lat)
                                    ]
                                };
                                dbPoolConnection.collection("Users")
                                    .update({ "_id": ObjectId(req.session.userId) }, { $set: newLocation }, function (err, dbResUserWithUpdatedLocation) {
                                        if (err) {
                                            res.send(err);
                                            console.log(err);
                                        }
                                        res.send("Ok with updated location");
                                        console.log("User " + dbResUserWithUpdatedLocation.email + " logged-in updating his/her location:");
                                        console.log("-> Lng: " + dbResUserWithUpdatedLocation.location.coordinates[0]);
                                        console.log("-> Lat: " + dbResUserWithUpdatedLocation.location.coordinates[1]);
                                    });
                            } else {
                                res.send("Ok");
                                console.log("User " + dbResUserWithThatEmail.email + " logged-in");
                            }
                        } else {
                            res.send("Wrong password");
                            console.log("User " + dbResUserWithThatEmail.email + " failed trying to login. Wrong password");
                        }
                    });
                } else {
                    res.send("Email not found");
                    console.log("User tried to login with a non-registered email: " + req.body.email);
                }
            });
        } else {
            res.status(400).send("Empty Fields");
            console.log("User tried to login without specifying both email and password");
        }
    });

    dbRoutes.post("/logout", function (req, res, next) {
        if (loginCheck(req, res)) {
            req.session.destroy(function (err) {
                if (err) {
                    console.log(err);
                } else {
                    return res.redirect("/");  // TODO something else ?
                }
            });
        }
    });

    dbRoutes.post("/messages", function (req, res, next) {
        if (loginCheck(req, res)) {
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
                if (err) {
                    res.send(err);
                    console.log(err);
                }
                messageData.location = dbResLoggedUser.location;
                dbPoolConnection.collection("Messages").insertOne(messageData, function (err, dbResPublishedMessage) {
                    if (err) {
                        res.send(err);
                        console.log(err);
                    }
                    res.send(dbResPublishedMessage);
                    console.log("A new message has been published:");
                    for (const property in dbResPublishedMessage) {
                        console.log("-> " + property + ": " + dbResPublishedMessage[property]);
                    }
                });
            });
        }
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

function loginCheck(req, res) {
    if (req.session.userId != null) {
        return true;
    } else {
        res.status(400).send("User not logged in.");
        return false;
    }
}




const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const bcrypt = require("bcrypt");
const boom = require('boom');

const URL = process.env.MONGODB_URI || "mongodb://heroku_sh9pbrkt:8u0np9l4apmmp6ur55t1o588p0@ds113452.mlab.com:13452/heroku_sh9pbrkt";
const SALT_ROUNDS = 10;
const MAX_DISTANCE_FULL_MESSAGES = 500; // 500 meters radius
const MAX_DISTANCE_STRIPPED_MESSAGES = 10000; // 10 Km radius
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
    if (!req.body.email || !req.body.password || !req.body.nickname) {
      if (LOG_CLIENT_ERRORS) { console.log("Someone tried to register without specifying email, password or nickname"); }
      return next(boom.badRequest("Cannot register new user: missing email, password or nickname"));
    }
    dbPoolConnection.collection("Users").findOne({ "email": req.body.email }, function (err, dbResUserWithThatEmail) {
      if (err) { return next(boom.badImplementation(err)); }
      if (dbResUserWithThatEmail != null) {
        if (LOG_CLIENT_ERRORS) { console.log(req.body.email + " tried to register again"); }
        return next(boom.badRequest("Email " + req.body.email + " already registered"));
      }
      bcrypt.hash(req.body.password, SALT_ROUNDS, function (err, hashed) {
        if (err) { return next(err); }
        let newUserData = {
          "email": req.body.email,
          "nickname": req.body.nickname,
          "password": hashed
        }
        dbPoolConnection.collection("Users").insertOne(newUserData, function (err, dbResNewUser) {
          if (err) { return next(err); }
          // uncomment next line if you want to login on registration:
          // req.session.userId = dbResNewUser._id;
          res.send("Registration succeeded with email " + req.body.email);
          if (LOG_SERVER_EVENTS) { console.log("Successfully registered new user " + req.body.email + " (" + req.body.nickname + ")"); }
        });
      });
    });
  });

  dbRoutes.get("/users", function(req, res, next) {
    if (req.session.userId == null) {
      if (LOG_CLIENT_ERRORS) { console.log("Someone tried to retrieve profile information without being logged-in"); }
      return next(boom.unauthorized("Cannot retrieve your profile if not logged-in"));
    }
    dbPoolConnection.collection("Users").findOne(new ObjectId(req.session.userId), function (err, dbResLoggedUser) {
      if (err) { return next(boom.badImplementation(err)); }
      res.send(dbResLoggedUser);
    });
  });

  dbRoutes.put("/login", function (req, res, next) {
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
        res.send("Logged-in as " + req.body.email);
        if (LOG_SERVER_EVENTS) { console.log("User " + dbResUserWithThatEmail.email + " logged-in"); }
      });
    });
  });

  dbRoutes.put("/logout", function (req, res, next) {
    const userId = req.session.userId;  // so it can be used in server log also after its destruction
    if (userId == null) {
      if (LOG_CLIENT_ERRORS) { console.log("Someone tried to logout without being logged-in"); }
      return next(boom.badRequest("Cannot logout if not logged-in"));
    }
    req.session.destroy(function (err) {
      if (err) { return next(boom.badImplementation(err)); }
      if (LOG_SERVER_EVENTS) { console.log("User with session id " + userId + " logged-out"); }
      res.send("Logged-out");
    });
  });

  dbRoutes.put("/users/location", function (req, res, next) {
    if (req.session.userId == null) {
      if (LOG_CLIENT_ERRORS) { console.log("Someone tried to update his/her location without being logged-in"); }
      return next(boom.unauthorized("Cannot update location if not logged-in"));
    }
    const lng = Number(req.body.lng);
    const lat = Number(req.body.lat);
    if (!lng || !lat) {
      if (LOG_CLIENT_ERRORS) { console.log("Someone tried to update his/her location without sending both lng and lat"); }
      return next(boom.badRequest("Cannot update location without both lng and lat"));
    }
    if (lng < -180 || lng > 180) {
      if (LOG_CLIENT_ERRORS) { console.log("Someone tried to update his/her location with an invalid lng value: " + lng); }
      return next(boom.badRequest("Cannot update location, invalid lng value: " + lng));
    }
    if (lat < -90 || lat > 90) {
      if (LOG_CLIENT_ERRORS) { console.log("Someone tried to update his/her location with an invalid lat value: " + lat); }
      return next(boom.badRequest("Cannot update location, invalid lat value: " + lat));
    }
    const dataToUpdate = {
      $set: {
        "location": {
          "type": "Point",
          "coordinates": [lng, lat]
        }
      }
    };
    dbPoolConnection.collection("Users")
      .updateOne({ "_id": ObjectId(req.session.userId) }, dataToUpdate, function (err, dbResUpdatedLocation) {
        if (err) { return next(boom.badImplementation(err)); }
        res.send("Updated location (lng:" + req.body.lng + ",lat:" + req.body.lat + ")");
        if (LOG_SERVER_EVENTS) {
          console.log("User with session id " + req.session.userId + " updated his/her location:");
          console.log("-> Lng: " + req.body.lng);
          console.log("-> Lat: " + req.body.lat);
        }
      });
  });

  dbRoutes.post("/messages", function (req, res, next) {
    if (req.session.userId == null) {
      if (LOG_CLIENT_ERRORS) { console.log("Someone tried to post a message without being logged-in"); }
      return next(boom.unauthorized("Cannot post a message if not logged-in"));
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
        dbPoolConnection.collection("Users").updateOne( 
          { _id: new ObjectId(req.session.userId) },
          { $push: { messages_id: dbResPublishedMessage.insertedId } },
          function(err, dbResAddedMessageToUser) {
            if (err) throw err;
            if (LOG_SERVER_EVENTS) { console.log("A new message has been published by user with session id " + req.session.userId); }
          }
        )
      });
    });
  });

  dbRoutes.get("/messages/full", function (req, res, next) {
    if (req.session.userId == null) {
      if (LOG_CLIENT_ERRORS) { console.log("Someone tried to retrieve full messages around him/her without being logged-in"); }
      return next(boom.unauthorized("Cannot retrieve full messages if not logged-in"));
    }
    dbPoolConnection.collection("Users").findOne(new ObjectId(req.session.userId), function (err, dbResLoggedUser) {
      if (err) { return next(boom.badImplementation(err)); }
      if (!dbResLoggedUser.location) {
        if (LOG_CLIENT_ERRORS) { console.log("Someone tried to retrieve full messages around him/her without having a defined location"); }
        return next(boom.unauthorized("Cannot retrieve full messages around you: we don't know your location"));
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
          if (err) { return next(boom.badImplementation(err)); }
          res.send(dbResMessagesFull);
          if (LOG_SERVER_EVENTS) { console.log("Sent " + dbResMessagesFull.length + " full message/s near user " + dbResLoggedUser.email); }
        });
    });
  });

  dbRoutes.get("/messages/full/user", function (req, res, next) {
    if (req.session.userId == null) {
      if (LOG_CLIENT_ERRORS) { console.log("Someone tried to retrieve full messages around him/her without being logged-in"); }
      return next(boom.unauthorized("Cannot retrieve full messages if not logged-in"));
    }
    dbPoolConnection.collection("Users").findOne(new ObjectId(req.session.userId), {fields: {_id: 0, messages_id: 1 }}, function (err, dbResUserFullMessagesId) {
      if (err) { return next(boom.badImplementation(err)); }
      console.log(dbResUserFullMessagesId);
      dbPoolConnection.collection("Messages").find( {_id : {$in : dbResUserFullMessagesId.messages_id }})
      .toArray(function (err, dbResUserFullMessages) {
        if (err) { return next(boom.badImplementation(err)); }
        res.send(dbResUserFullMessages);
        if (LOG_SERVER_EVENTS) { console.log("Sent " + dbResUserFullMessages.length + " full message/s of user with session: " + req.session.userId); }
      })
    })
  });

  dbRoutes.get("/messages/stripped", function (req, res, next) {
    dbPoolConnection.collection("Messages")
      .find({
        "location": {
          /* $near: {
            $geometry: {
              "type": "Point",
              "coordinates": [
                Number(req.query.lng),
                Number(req.query.lat)
              ]
            },
            $maxDistance: MAX_DISTANCE_STRIPPED_MESSAGES
          } */
          $geoWithin: {
            $box: [
              [ Number(req.query.cornerBottomLeft[0]) , Number(req.query.cornerBottomLeft[1]) ],
              [ Number(req.query.cornerUpperRight[0]) , Number(req.query.cornerUpperRight[1]) ]
            ]
         }
        }
      })
      .toArray(function (err, dbResMessagesStripped) {
        if (err) { return next(boom.badImplementation(err)); }
        dbResMessagesStripped.forEach(function (val) {
          delete val.author_id;  // ALTERNATIVE: si può anche costruire direttamente un nuovo oggetto
          delete val.text;       //              solamente con i campi che sono necessari.
          delete val.comments_id;
        });
        res.send(dbResMessagesStripped);
        if (LOG_SERVER_EVENTS) { console.log("Sent " + dbResMessagesStripped.length + " stripped messages near (lng:" + req.query.lng + ",lat:" + req.query.lat + ")"); }
      });
  });

  // dbRoutes.get("/testSession", function(req, res, next) {
  //     console.log(req.session.userId);
  // });

  return dbRoutes;
})();

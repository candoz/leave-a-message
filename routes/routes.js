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

const BADGE_BETA_TESTER = "beta-tester";
const BADGE_EXPLORER = "explorer";
const BADGE_TOP_CONTRIBUTOR = "top-contributor";

const KM_COVERED_GOAL = 1000000;
const TOTAL_LIKES_GOAL = 10000;

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
      if (err) return next(boom.badImplementation(err));
      if (dbResUserWithThatEmail != null) {
        if (LOG_CLIENT_ERRORS) { console.log(req.body.email + " tried to register again"); }
        return next(boom.badRequest("Email " + req.body.email + " already registered"));
      }
      bcrypt.hash(req.body.password, SALT_ROUNDS, function (err, hashed) {
        if (err) return next(boom.badImplementation(err));
        let newUserData = {
          "email": req.body.email,
          "nickname": req.body.nickname,
          "password": hashed
        }
        dbPoolConnection.collection("Users").insertOne(newUserData, function (err, dbResNewUser) {
          if (err) return next(boom.badImplementation(err));
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
      if (err) return next(boom.badImplementation(err));
      res.send(dbResLoggedUser);
    });
  });

  dbRoutes.put("/login", function (req, res, next) {
    if (!req.body.email || !req.body.password) {
      if (LOG_CLIENT_ERRORS) { console.log("User tried to login without specifying both email and password"); }
      return next(boom.badRequest("Missing email and/or password"));
    }
    dbPoolConnection.collection("Users").findOne({ "email": req.body.email }, function (err, dbResUserWithThatEmail) {
      if (err) return next(boom.badImplementation(err));
      if (!dbResUserWithThatEmail) {
        if (LOG_CLIENT_ERRORS) { console.log("User tried to login with a non-registered email: " + req.body.email); }
        return next(boom.badRequest("Email not registered"));
      }
      bcrypt.compare(req.body.password, dbResUserWithThatEmail.password, function (err, cryptResult) {
        if (err) return next(boom.badRequest(err));
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
      if (err) return next(boom.badImplementation(err));
      if (LOG_SERVER_EVENTS) { console.log("User with session id " + userId + " logged-out"); }
      res.send("Logged-out");
    });
  });

  dbRoutes.put("/users/location", function (req, res, next) {
    if (req.session.userId == null) {
      if (LOG_CLIENT_ERRORS) { console.log("Someone tried to update his/her location without being logged-in"); }
      return next(boom.unauthorized("Cannot update location if not logged-in"));
    }
    const newLng = Number(req.body.lng);
    const newLat = Number(req.body.lat);
    if (!newLng || !newLat) {
      if (LOG_CLIENT_ERRORS) { console.log("Someone tried to update his/her location without sending both lng and lat"); }
      return next(boom.badRequest("Cannot update location without both lng and lat"));
    }
    if (newLng < -180 || newLng > 180) {
      if (LOG_CLIENT_ERRORS) { console.log("Someone tried to update his/her location with an invalid lng value: " + newLng); }
      return next(boom.badRequest("Cannot update location, invalid lng value: " + newLng));
    }
    if (newLat < -90 || newLat > 90) {
      if (LOG_CLIENT_ERRORS) { console.log("Someone tried to update his/her location with an invalid lat value: " + newLat); }
      return next(boom.badRequest("Cannot update location, invalid lat value: " + newLat));
    }

    dbPoolConnection.collection("Users").findOne(new ObjectId(req.session.userId), {fields: {_id: 0, location: 1, km_covered: 1, badges: 1}}, function (err, dbResUserInfo) {
      console.log(dbResUserInfo);
      if (err) return next(boom.badImplementation(err));
      let dataToUpdate = {
        location: {
          type: "Point",
          coordinates: [newLng, newLat]
        }
      };

      if (dbResUserInfo.location != null && Array.isArray(dbResUserInfo.location.coordinates) && dbResUserInfo.location.coordinates.length === 2) {
        const oldLat = dbResUserInfo.location.coordinates[1];
        const oldLng = dbResUserInfo.location.coordinates[0];
        const kmCoveredUpdated = (dbResUserInfo.kmCovered || 0) + distance(oldLat, oldLng, newLat, newLng, "K");
        dataToUpdate.km_covered = kmCoveredUpdated;
        
        if (kmCoveredUpdated >= KM_COVERED_GOAL) {
          if (dbResUserInfo.badges == null) {
            dataToUpdate.badges = [BADGE_EXPLORER]
          } else if (Array.isArray(dbResUserInfo.badges) && !dbResUserInfo.badges.includes(BADGE_EXPLORER)) {
            dataToUpdate.badges = (dbResUserInfo.badges).concat([BADGE_EXPLORER]);
          }
        }
      }
      
      dbPoolConnection.collection("Users").updateOne(new ObjectId(req.session.userId), { $set: dataToUpdate }, function (err) {
        if (err) return next(boom.badImplementation(err));
        res.send("Updated location (lng:" + req.body.lng + ",lat:" + req.body.lat + ")");
        if (LOG_SERVER_EVENTS) {
          console.log("User with session id " + req.session.userId + " updated his/her location:");
          console.log("-> Lng: " + req.body.lng);
          console.log("-> Lat: " + req.body.lat);
        }
      });
    })
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
      if (err) return next(boom.badImplementation(err));
      messageData.location = dbResLoggedUser.location;
      dbPoolConnection.collection("Messages").insertOne(messageData, function (err, dbResPublishedMessage) {
        if (err) return next(boom.badImplementation(err));
        res.send("Message succesfully published");
        dbPoolConnection.collection("Users").updateOne(new ObjectId(req.session.userId), { $push: { messages_id: dbResPublishedMessage.insertedId } }, function(err) {
          if (err) return next(boom.badImplementation(err));
          if (LOG_SERVER_EVENTS) { console.log("A new message has been published by user with session id " + req.session.userId); }
        });
      });
    });
  });

  dbRoutes.post("/messages/comment", function (req, res, next) {
    if (req.session.userId == null) {
      if (LOG_CLIENT_ERRORS) { console.log("Someone tried to post a comment without being logged-in"); }
      return next(boom.unauthorized("Cannot post a comment if not logged-in"));
    }
    if (req.body.messageId == null) {
      if (LOG_CLIENT_ERRORS) { console.log("Someone tried to post a comment without specifying the message id"); }
      return next(boom.badRequest("Cannot post a comment to a unknown message"));
    }
    if (req.body.text == null) {
      if (LOG_CLIENT_ERRORS) { console.log("Someone tried to post a comment without specifying text"); }
      return next(boom.badRequest("Cannot post a comment with an empty message"));
    }
    console.log(req.body);
    dbPoolConnection.collection("Users").findOne(new ObjectId(req.session.userId), function (err, dbResUser) {
      if (err) return next(boom.badImplementation(err));
      var newComment = {
        $push: {
          comments: { 
            author_nickname: dbResUser.nickname,
            author_name: dbResUser.name,
            text: req.body.text
          } 
        }
      };
      dbPoolConnection.collection("Messages").updateOne(new ObjectId(req.body.messageId), newComment, function(err) {
        if (err) return next(boom.badImplementation(err));
        console.log("Comment added to " + req.body.messageId + " " + dbResUser.nickname);
      });
    });
  });

  dbRoutes.put("/messages/like", function (req, res, next) {
    if (req.session.userId == null) {
      if (LOG_CLIENT_ERRORS) { console.log("Someone tried to like a message without being logged-in"); }
      return next(boom.unauthorized("Cannot like a message if not logged-in"));
    }
    if (req.body.messageId == null) {
      if (LOG_CLIENT_ERRORS) { console.log("Someone tried to like a message without specifying the message id"); }
      return next(boom.badRequest("Cannot like an unknown message"));
    }
    dbPoolConnection.collection("Users").findOne(new ObjectId(req.session.userId), function (err) {
      if (err) return next(boom.badImplementation(err));
      dbPoolConnection.collection("Messages").updateOne(new ObjectId(req.body.messageId), { $addToSet: { likes: req.session.userId } }, function(err, dbResLikedBy) {
        if (err) return next(boom.badImplementation(err));
        if (dbResLikedBy.modifiedCount > 0) {
          res.send("Message " + req.body.messageId + " liked");
          if (LOG_SERVER_EVENTS) { console.log("Like added for message " + req.body.messageId); }
          dbPoolConnection.collection("Messages").findOne(new ObjectId(req.body.messageId), { fields: { _id: 0, author_id: 1 } }, function (err, dbResAuthorId) {
            if (err) return next(boom.badImplementation(err));
            dbPoolConnection.collection("Users").findOneAndUpdate(new ObjectId(dbResAuthorId.author_id), { $inc: { reputation: 1 } }, { returnNewDocument: true }, function(err, dbResAuthor) {
              if (err) return next(boom.badImplementation(err));
              if (dbResAuthor.reputation >= TOTAL_LIKES_GOAL) {
                dbPoolConnection.collection("Messages").updateOne(new ObjectId(dbResAuthorId.author_id), { $addToSet: { badges: TOTAL_LIKES_GOAL } }, function(err) {
                  if (err) return next(boom.badImplementation(err));
                  if (dbResLikedBy.modifiedCount > 0) {
                    if (LOG_SERVER_EVENTS) { console.log("Added " + TOTAL_LIKES_GOAL + " badge to user " + dbResAuthorId.author_id); }
                  }
                });
              }
            });
          });
        }  
      });
    });
  });

  dbRoutes.put("/messages/unlike", function (req, res, next) {
    if (req.session.userId == null) {
      if (LOG_CLIENT_ERRORS) { console.log("Someone tried to unlike a message without being logged-in"); }
      return next(boom.unauthorized("Cannot like a message if not logged-in"));
    }
    if (req.body.messageId == null) {
      if (LOG_CLIENT_ERRORS) { console.log("Someone tried to unlike a message without specifying the message id"); }
      return next(boom.badRequest("Cannot like an unknown message"));
    }
    dbPoolConnection.collection("Users").findOne(new ObjectId(req.session.userId), function (err) {
      if (err) return next(boom.badImplementation(err));
      dbPoolConnection.collection("Messages").updateOne(new ObjectId(req.body.messageId), { $pull: { likes: req.session.userId } }, function(err, dbResLikedBy) {
        if (err) return next(boom.badImplementation(err));
        if (dbResLikedBy.modifiedCount > 0) {
          res.send("Message " + req.body.messageId + " unliked");
          if (LOG_SERVER_EVENTS) { console.log("Like removed for message " + req.body.messageId); }
          dbPoolConnection.collection("Messages").findOne(new ObjectId(req.body.messageId), { fields: { _id: 0, author_id: 1 } }, function (err, dbResAuthorId) {
            if (err) return next(boom.badImplementation(err));
            dbPoolConnection.collection("Users").updateOne(new ObjectId(dbResAuthorId.author_id), { $inc: { reputation: -1 } }, function(err) {
              if (err) return next(boom.badImplementation(err));
            });
          });
        }  
      });
    });
  });

  dbRoutes.get("/messages/full", function (req, res, next) {
    if (req.session.userId == null) {
      if (LOG_CLIENT_ERRORS) { console.log("Someone tried to retrieve full messages around him/her without being logged-in"); }
      return next(boom.unauthorized("Cannot retrieve full messages if not logged-in"));
    }
    dbPoolConnection.collection("Users").findOne(new ObjectId(req.session.userId), function (err, dbResLoggedUser) {
      if (err) return next(boom.badImplementation(err));
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
          if (err) return next(boom.badImplementation(err));
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
      if (err) return next(boom.badImplementation(err));
      console.log(dbResUserFullMessagesId);
      dbPoolConnection.collection("Messages").find( {_id : {$in : dbResUserFullMessagesId.messages_id }})
      .toArray(function (err, dbResUserFullMessages) {
        if (err) return next(boom.badImplementation(err));
        res.send(dbResUserFullMessages);
        if (LOG_SERVER_EVENTS) { console.log("Sent " + dbResUserFullMessages.length + " full message/s of user with session: " + req.session.userId); }
      })
    })
  });

  dbRoutes.get("/messages/stripped", function (req, res, next) {
    dbPoolConnection.collection("Messages")
      .find({
        "location": {
          $geoWithin: {
            $box: [
              [ Number(req.query.cornerBottomLeft[0]) , Number(req.query.cornerBottomLeft[1]) ],
              [ Number(req.query.cornerUpperRight[0]) , Number(req.query.cornerUpperRight[1]) ]
            ]
         }
        }
      })
      .toArray(function (err, dbResMessagesStripped) {
        if (err) return next(boom.badImplementation(err));
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


//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//:::                                                                         :::
//:::  This routine calculates the distance between two points (given the     :::
//:::  latitude/longitude of those points). It is being used to calculate     :::
//:::  the distance between two locations using GeoDataSource (TM) products   :::
//:::                                                                         :::
//:::  Passed to function:                                                    :::
//:::    lat1, lon1 = Latitude and Longitude of point 1 (in decimal degrees)  :::
//:::    lat2, lon2 = Latitude and Longitude of point 2 (in decimal degrees)  :::
//:::    unit = the unit you desire for results                               :::
//:::           where: 'M' is statute miles (default)                         :::
//:::                  'K' is kilometers                                      :::
//:::                  'N' is nautical miles                                  :::
//:::                                                                         :::
//:::  Official Web site: https://www.geodatasource.com                       :::
//:::  GeoDataSource.com (C) All Rights Reserved 2017                         :::
//:::                                                                         :::
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
function distance(lat1, lon1, lat2, lon2, unit) {
	var radlat1 = Math.PI * lat1/180
	var radlat2 = Math.PI * lat2/180
	var theta = lon1-lon2
	var radtheta = Math.PI * theta/180
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	if (dist > 1) {
		dist = 1;
	}
	dist = Math.acos(dist)
	dist = dist * 180/Math.PI
	dist = dist * 60 * 1.1515
	if (unit=="K") { dist = dist * 1.609344 }
	if (unit=="N") { dist = dist * 0.8684 }
	return dist
}

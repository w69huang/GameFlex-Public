"use strict";

var express = require('express');

var router = express.Router();

var mySQLConnection = require('../database/mysql');

var user = require('../database/models/mysql.user.model');

var multer = require('multer');

var mongoose = require('mongoose');

var config = require('../config');

var fs = require('fs');

var _require = require('path'),
    resolve = _require.resolve;

module.exports = function (upload) {
  var url = config.mongoURI;
  var connect = mongoose.createConnection(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  var gfs; //Deck Model

  var Deck = require('../database/models/userDeck');

  connect.once('open', function () {
    //initialize Gridfs datastream
    gfs = new mongoose.mongo.GridFSBucket(connect.db, {
      bucketName: "uploads"
    });
  }); //TODO: Single file upload functionality(?)

  /*
      Post: Upload multiple files
  */

  router.route('/upload').post(upload.array('file', 60), function (req, res, next) {
    try {
      console.log("There was not an error");
      console.log(req.body);
      var cardID = req.files[0].id;
      var userID = req.body.username;
      var deckName = req.body.deckName;
      console.log(userID);
      console.log(deckName); // Deck.find({ deckName: deckName, userID: userID })
      //         .then((foundDeck) => {console.log(foundDeck)})
      //             .save();

      Deck.findOneAndUpdate({
        deckName: deckName,
        userID: userID
      }, {
        $push: {
          imageID: cardID
        }
      }, function (err, success) {
        if (err) {
          console.log(err + " was the erro");
        } else {
          console.log(success);
        }

        ;
      });
      res.status(200).json({
        success: true,
        message: req.files.length + ' file(s) uploaded succesfully'
      });
    } catch (err) {
      console.log("there was an error!");
      console.log(err);
      res.status(500).json({
        success: false,
        message: err + " was the error"
      });
    }
  });
  /*
      GET: Fetches all the files in the uploads collection
  */

  router.route('/files').get(function (req, res, next) {
    //find the deck using deckname and userID
    console.log("In the file grabber");
    var userID = req.query.userID;
    var deckName = req.query.deckName;
    var fileArray = [];
    var fileProcessCounter = 0;
    Deck.findOne({
      deckName: deckName,
      userID: userID
    }).then(function (currentDeck) {
      var cardIDs = currentDeck.imageID;
      console.log("user Id " + userID);
      console.log("deckName " + deckName);
      console.log("card IDs " + cardIDs);
      console.log(currentDeck);
      gfs.find({
        _id: {
          $in: cardIDs
        }
      }).toArray(function (err, files) {
        console.log(files);

        if (!files || files.length === 0) {
          return res.status(200).json({
            success: false,
            message: 'No files available'
          });
        } //image formats supported


        files.map(function (file) {
          if (file.contentType === 'image/jpeg' || file.contentType === 'image/png' || file.contentType === 'image/svg+xml') {
            file.isImage = true;
            console.log("file analyzed");
            var rstream = gfs.openDownloadStream(file._id);
            var bufs = [];
            rstream.on('data', function (chunk) {
              bufs.push(chunk);
            }).on('end', function () {
              // done
              var fbuf = Buffer.concat(bufs);
              var base64 = fbuf.toString('base64');
              fileArray.push(base64);
              fileProcessCounter++;

              if (fileProcessCounter === files.length) {
                console.log("file array sent");
                res.send(fileArray);
              }
            });
          } else {//     res.status(404).json({
            //     err: 'Not an image',
            //    });
          }
        }); // res.status(200).json({
        //     success: true,
        //     fileArray,
        // });
      });
    }); //gridFS fid by ID(????)
    // gfs.find({ files_id: { $in : cardIDs } }).toArray((err, files) => {
    //     //console.log(files);
    //     if (!files || files.length === 0) {
    //         return res.status(200).json({
    //             success: false,
    //             message: 'No files available'
    //         });
    //     }
    //     //image formats supported
    //     files.map(file => {
    //         if (file.contentType === 'image/jpeg'
    //             || file.contentType === 'image/png'
    //             || file.contentType === 'image/svg+xml') {
    //                 file.isImage = true;
    //             } else {
    //                 file.isImage = false;
    //             }
    //     });
    //     res.status(200).json({
    //         success: true,
    //         files,
    //     });
    // });
  });
  /* 
      GET: Fetches a particular file by filename
  */

  router.route('/file/:filename').get(function (req, res, next) {
    console.log(req.params.filename);
    gfs.find({
      filename: req.params.filename
    }).toArray(function (err, files) {
      if (!files[0] || files.length === 0) {
        return res.status(200).json({
          success: false,
          message: 'No files available'
        });
      }

      res.status(200).json({
        success: true,
        file: files[0]
      });
    });
  });
  /* 
      GET: Fetches a particular image and render on browser
  */

  router.route('/image/:filename').get(function (req, res, next) {
    gfs.find({
      filename: req.params.filename
    }).toArray(function (err, files) {
      if (!files[0] || files.length === 0) {
        return res.status(200).json({
          success: false,
          message: 'No files available'
        });
      }

      if (files[0].contentType === 'image/jpeg' || files[0].contentType === 'image/png' || files[0].contentType === 'image/svg+xml') {
        // render image to browser
        var rstream = gfs.openDownloadStreamByName(req.params.filename);
        var bufs = [];
        rstream.on('data', function (chunk) {
          bufs.push(chunk);
        }).on('end', function () {
          // done
          var fbuf = Buffer.concat(bufs);
          var base64 = fbuf.toString('base64');
          res.send(base64);
        });
      } else {
        res.status(404).json({
          err: 'Not an image'
        });
      }
    });
  });
  /*
       DELETE: delete a file by filename
   */

  router.route('/file/del').post(function (req, res, next) {
    console.log('test!!!!');
    console.log(req.body.id);
    gfs["delete"](new mongoose.Types.ObjectId(req.body.id), function (err, data) {
      if (err) {
        return res.status(404).json({
          err: err
        });
      }

      res.status(200).json({
        success: true,
        message: 'File with ID ' + req.body.id + ' is deleted'
      });
    });
  });
  router.route('/delete-deck')["delete"](function (req, res, next) {
    //iterate over all cards in the deck
    //delete the deck itself from mongo
    //this route recieves deck ID
    //finds and deletes all images with deck ID 
    //deles the deck
    //TODO: delete the deck itself from Mongo (not just the cards from GFS)
    //TODO: better error handling
    var userID = req.query.userID;
    var deckName = req.query.deckName;
    var fileProcessCounter = 0;
    console.log("request received to delete " + deckName + "by user: " + userID);
    Deck.findOne({
      deckName: deckName,
      userID: userID
    }).then(function (currentDeck) {
      if (currentDeck) {
        console.log(currentDeck + " has been found");
        var cardIDs = currentDeck.imageID;
        var cardMongoIDs = [];

        for (var i = 0; i < cardIDs.length; i++) {
          cardMongoIDs.push(new mongoose.Types.ObjectId(cardIDs[i]));
        }

        if (cardMongoIDs.length > 0) {
          cardMongoIDs.forEach(function (cardMongoID) {
            gfs["delete"](cardMongoID, function (err, data) {
              if (err) {
                console.log(err);
              }

              if (data) {
                console.log(data);
              }

              fileProcessCounter++;

              if (fileProcessCounter === cardMongoIDs.length) {
                Deck.deleteOne({
                  deckName: deckName,
                  userID: userID
                })["catch"](function (error) {
                  console.log(error);
                });
                res.status(200).json({
                  success: true,
                  message: deckName + ' has been deleted'
                });
              }
            });
          });
        } else {
          Deck.deleteOne({
            deckName: deckName,
            userID: userID
          })["catch"](function (error) {
            console.log(error);
          });
          res.status(200).json({
            success: true,
            message: deckName + ' has been deleted'
          });
        }
      } else {
        console.log("deck not found");
        res.status(500).json({
          success: false,
          message: deckName + ' cannot be found'
        });
      }
    })["catch"](function (err) {
      res.status(500).json({
        success: false,
        message: "error message is " + err
      });
    });
  }); //TODO: integrate deck functionality into the routes

  router.route('/new-deck').post(function (req, res, next) {
    var deckName = req.body.deckName;
    var username = req.body.userID;
    var deckList = [];
    Deck.find({
      deckName: deckName,
      userID: username
    }).then(function (Deck) {
      return deckList = Deck;
    });

    if (deckList.length != 0) {
      //TODO: send error to user
      res.status(500).json({
        message: 'Deck already exists'
      });
    } else {
      var deck = new Deck({
        userID: username,
        deckName: deckName
      });
      deck.save().then(function (result) {
        console.log(result);
        res.status(201).json({
          message: "Deck creation complete!",
          deck: result
        });
      })["catch"](function (err) {
        console.log(err), res.status(500).json({
          error: err
        });
      });
    }
  });
  router.route('/get').post(function (req, res, next) {
    var username = req.body.userID;
    Deck.find({
      userID: username
    }).then(function (deckList) {
      return res.send(deckList);
    })["catch"](function (error) {
      return console.log(error);
    });
  }); //deletes all decks from Mongo storage

  router.route('/deleteAllDecks')["delete"](function (req, res) {
    Deck.deleteMany().then(function () {
      return console.log("All decks have been deleted");
    })["catch"](function (err) {
      console.log(err);
    });
  }); //deletes all images from GFS storage

  router.route('/clearGFS')["delete"](function (req, res) {
    gfs.drop()["catch"](function (err) {
      console.log(err);
    });
  });
  return router;
};
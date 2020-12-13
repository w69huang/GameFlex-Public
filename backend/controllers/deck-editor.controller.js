const express = require('express');
const router = express.Router();
const mySQLConnection = require('../database/mysql');
const user = require('../database/models/mysql.user.model');
const multer = require('multer');
const mongoose = require('mongoose');
const config = require('../config');
const fs = require('fs');
const { resolve } = require('path');

module.exports = (upload) => {
    const url = config.mongoURI;
    const connect = mongoose.createConnection(url, {useNewUrlParser: true, useUnifiedTopology: true });

    let gfs;

    //Deck Model
    let Deck = require('../database/models/userDeck');

    connect.once('open', () => {
        //initialize Gridfs datastream
        gfs = new mongoose.mongo.GridFSBucket(connect.db, {
            bucketName: "uploads"
        });
    });

    //TODO: Single file upload functionality(?)

    /*
        Post: Upload multiple files
    */
    router.route('/upload')
        .post(upload.array('file', 60), (req, res, next) => {
            try{
                console.log("There was not an error");
                console.log(req.body);
                const cardID = req.files[0].id;
                const userID = req.body.username;
                const deckName = req.body.deckName;

                console.log(userID);
                console.log(deckName);
                // Deck.find({ deckName: deckName, userID: userID })
                //         .then((foundDeck) => {console.log(foundDeck)})
                //             .save();
                Deck.findOneAndUpdate({ deckName: deckName, userID: userID }, 
                    {$push: {imageID: cardID} },
                    function (err, success) {
                        if(err) {
                            console.log(err + " was the erro");
                        } else {
                            console.log(success);
                        };
                    });
             

                res.status(200).json({
                    success: true,
                    message: req.files.length + ' file(s) uploaded succesfully',
                });
            }
            catch(err) {
                console.log("there was an error!");
                console.log(err);
                res.status(500).json({
                    success: false,
                    message: err + " was the error"
                })
            }
        });
    

    /*
        GET: Fetches all the files in the uploads collection
    */
    router.route('/files').get((req, res, next) => {
        //find the deck using deckname and userID
        const userID = req.query.userID;
        const deckName = req.query.deckName;
        const currentDeck = Deck.findOne({ deckName: deckName, userID: userID });
        var cardIDs = currentDeck.imageID;
        
        //gridFS fid by ID(????)
        gfs.find({ deckName: deckName }).toArray((err, files) => {
            if (!files || files.length === 0) {
                return res.status(200).json({
                    success: false,
                    message: 'No files available'
                });
            }

            //image formats supported
            files.map(file => {
                if (file.contentType === 'image/jpeg'
                    || file.contentType === 'image/png'
                    || file.contentType === 'image/svg+xml') {
                        file.isImage = true;
                    } else {
                        file.isImage = false;
                    }
            });

            res.status(200).json({
                success: true,
                files,
            });
        });
    });

    /* 
        GET: Fetches a particular file by filename
    */
    router.route('/file/:filename').get((req, res, next) => {
        console.log(req.params.filename)
        gfs.find({filename: req.params.filename }).toArray((err, files) => {
            if (!files[0] || files.length === 0) {
                return res.status(200).json({
                    success: false,
                    message: 'No files available',
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
   router.route('/image/:filename').get((req, res, next) => {
       gfs.find({ filename: req.params.filename }).toArray((err, files) => {
           if (!files[0] || files.length === 0) {
               return res.status(200).json({
                   success: false,
                   message: 'No files available',
               });
           }

           if (files[0].contentType === 'image/jpeg' 
                || files[0].contentType === 'image/png' 
                || files[0].contentType === 'image/svg+xml') {
               // render image to browser
            var rstream = gfs.openDownloadStreamByName(req.params.filename);

            var bufs = [];
            
            rstream.on('data', function(chunk) {
            
                bufs.push(chunk);
            
            }).on('end', function() { // done
            
                var fbuf = Buffer.concat(bufs);
            
                var base64 = (fbuf.toString('base64'));

                res.send(base64);
            
            });
           } else {
               res.status(404).json({
                   err: 'Not an image',
               });
           }
       });
   });

   /*
        DELETE: delete a file by filename
    */
   router.route('/file/del').post((req, res, next) => {
       console.log('test!!!!')
       console.log(req.body.id);
       gfs.delete(new mongoose.Types.ObjectId(req.body.id),
       (err, data) => {
           if (err) {
               return res.status(404).json({err: err});
           }

           res.status(200).json({
               success: true,
               message: 'File with ID '+req.body.id+' is deleted',
           });
       });
   });

   //TODO: integrate deck functionality into the routes



   router.route('/new-deck').post((req, res, next) => {
        const deckName = req.body.deckName;
        const username = req.body.userID;
        //console.log(req);
        //console.log(deckName, ' ', username);
 

        let deckList = [];

        Deck.find({ deckName: deckName, userID: username })
        .then((Deck) => deckList = Deck)

        if (deckList.length != 0) {
            //TODO: send error to user
            res.status(500).json({
                message: 'Deck already exists'
            });
        } else {
            const deck = new Deck({
                userID: username,
                deckName: deckName
            });
            deck.save().then(result => {
                console.log(result);
                res.status(201).json({
                    message: "Deck creation complete!!",
                })
            }).catch(err => {
                console.log(err),
                res.status(500).json({
                    error: err
                });
            })
        }
    })

    router.route('/get').post((req, res, next) => {
            const username = req.body.userID;
            Deck.find({ userID: username })
            .then((deckList) => res.send(deckList))
            .catch((error) => console.log(error));
    });

    router.route('/deleteAllDecks').delete((req, res) => {
        Deck.deleteMany().then(() => console.log("All decks have been deleted")).catch((err) => {console.log(err)});
    })

    return router;
};

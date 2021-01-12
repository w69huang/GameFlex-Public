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
    connect.catch((err) => {
        console.log(err);
    });

    let gfs;

    //Deck Model
    let Deck = require('../database/models/userDeck');

    connect.once('open', () => {
        //initialize Gridfs datastream
        gfs = new mongoose.mongo.GridFSBucket(connect.db, {
            bucketName: "userCards"
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
                console.log("FILES:");
                console.log(req.files[0]);
                const cardID = req.files[0].id;
                const userID = req.body.username;
                const deckName = req.body.deckName;

                
                console.log(userID);
                console.log(deckName);
                
                Deck.findOneAndUpdate({ deckName: deckName, userID: userID }, 
                    {$push: {imageID: cardID} },
                    function (err, success) {
                        if(err) {
                            console.log(err + " was the error");
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
        console.log("In the file grabber");
        const userID = req.query.userID;
        const deckName = req.query.deckName;

        let fileArray = [];
        var fileProcessCounter = 0;
        
        Deck.findOne({ deckName: deckName, userID: userID })
            .then((currentDeck) => {

                var cardIDs = currentDeck.imageID;
        
                console.log("user Id " + userID);
                console.log("deckName " + deckName);
                console.log("card IDs " + cardIDs);
                console.log(currentDeck);

                gfs.find({ _id: { $in : cardIDs } }).toArray((err, files) => {
                    console.log(files);
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

                                console.log("file analyzed");
                                
                                var rstream = gfs.openDownloadStream(file._id);

                                var bufs = [];
                                
                                rstream.on('data', function(chunk) {
                                
                                    bufs.push(chunk);
                                
                                }).on('end', 
                                    function() { // done
                                        var fbuf = Buffer.concat(bufs);
                                        var base64 = (fbuf.toString('base64'));
                                        fileArray.push({base64: base64, id: file._id, fileName: file.filename});
                                        fileProcessCounter++; 
                                        if(fileProcessCounter === files.length) {
                                            console.log("file array sent")
                                            res.send(fileArray);
                                        }
                                    });
                        } else {
                            fileProcessCounter++;
                        //     res.status(404).json({
                        //     err: 'Not an image',
                        //    });
                        }

                    });
                    // res.status(200).json({
                    //     success: true,
                    //     fileArray,
                    // });
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
        GET: Fetches a particular image and render on browser - !!!!!   NOT USED   !!!!!
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
   router.route('/file/del').delete((req, res, next) => {
       console.log('deleting file: ' + req.query.id);

       //TODO: remove fileID from mongo deck storage!!! 
    
       gfs.delete(new mongoose.Types.ObjectId(req.query.id),
       (err, data) => {
           if (err) {
               return res.status(404).json({
                   success: false,
                   err: err});
           }

           res.status(200).json({
               success: true,
               message: 'File with ID '+req.query.id+' is deleted',
           });
       });
   });

   router.route('/delete-deck').delete((req, res, next) => {

    //iterate over all cards in the deck
    //delete the deck itself from mongo

    //this route recieves deck ID
    //finds and deletes all images with deck ID 
    //deles the deck

    //TODO: delete the deck itself from Mongo (not just the cards from GFS)
    //TODO: better error handling

        const userID = req.query.userID;
        const deckName = req.query.deckName;
        var fileProcessCounter = 0;
        console.log("request received to delete " +  deckName + "by user: " + userID);
        //find the deck
        Deck.findOne({ deckName: deckName, userID: userID })
            .then((currentDeck) => {
                //Check that the deck exists
                if(currentDeck){
                    console.log(currentDeck + " has been found")

                    var cardIDs = currentDeck.imageID;
                    let cardMongoIDs = [];
                    //delete all cards in the deck from GFS storage
                    for(let i = 0; i < cardIDs.length; i++){
                        cardMongoIDs.push(new mongoose.Types.ObjectId(cardIDs[i])); 
                    }
                    if(cardMongoIDs.length > 0) {
                        cardMongoIDs.forEach((cardMongoID) => {
                            gfs.delete(cardMongoID, (err, data) => { 
                                if(err){
                                    console.log(err);
                                } 
                                if(data){
                                    console.log(data);
                                }
                                fileProcessCounter++; 
                                if(fileProcessCounter === cardMongoIDs.length) {
                                    Deck.deleteOne({deckName: deckName, userID: userID}).catch((error) => {
                                        console.log(error);
                                    });
                                    res.status(200).json({
                                        success: true,
                                        message: deckName + ' has been deleted',
                                    });
                                }
                            });
                        });
                    } else {
                        Deck.deleteOne({deckName: deckName, userID: userID}).catch((error) => {
                            console.log(error);
                        });
                        res.status(200).json({
                            success: true,
                            message: deckName + ' has been deleted',
                        }); 
                    }
                } else {
                    console.log("deck not found");
                    res.status(500).json({
                        success: false,
                        message: deckName + ' cannot be found',
                    }); 
                }

                
        }).catch((err) => {
            res.status(500).json({
                success: false,
                message: "error message is " + err
            });
        });



    });
   /*
        NEW-DECK: Create a new deck
    */
   router.route('/new-deck').post((req, res, next) => {
        const deckName = req.body.deckName;
        const username = req.body.userID;
        let deckList = [];

        console.log("Creating deck: " + deckName);

        Deck.find({ deckName: deckName, userID: username })
        .then((Deck) => deckList = Deck)

        if (deckList.length != 0) {
            //Duplicate deckname check also perfomred in front end
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
                    message: "Deck creation complete!",
                    deck: result
                })
            }).catch(err => {
                console.log(err),
                res.status(500).json({
                    error: err
                });
            })
        }
    })
   /*
        GET: find all decks associated with a specific username
    */
    router.route('/get').post((req, res, next) => {
            const username = req.body.userID;
            Deck.find({ userID: username })
            .then((deckList) => res.send(deckList))
            .catch((error) => console.log(error));
    });

    /*
        Sort cards by filename
    */


    /*
        DEV TOOLS ---
    */

    //deletes all decks from Mongo storage
    router.route('/deleteAllDecks').delete((req, res) => {
        Deck.deleteMany().then(() => console.log("All decks have been deleted")).catch((err) => {console.log(err)});
    });

    //deletes all images from GFS storage
    router.route('/clearGFS').delete((req, res) => {
        gfs.drop().catch((err) => {
            console.log(err);
        });
    });

    return router;
};

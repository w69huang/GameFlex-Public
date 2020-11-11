let express = require('express'),
  multer = require('multer'),
  mongoose = require('mongoose'),
  router = express.Router(),
  config = require('../config');
  var fs = require('fs');
const { resolve } = require('path');


module.exports = (upload) => {
    const url = config.mongoURI;
    const connect = mongoose.createConnection(url, {useNewUrlParser: true, useUnifiedTopology: true });

    let gfs;

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
            res.status(200).json({
                success: true,
                message: req.files.length + ' file(s) uploaded succesfully',
            });
        });

    /*
        GET: Fetches all the files in the uploads collection
    */
    router.route('/files').get((req, res, next) => {
        gfs.find().toArray((err, files) => {
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

   //Deck Model
   let Deck = require('../database/models/userDeck');

   router.route('/new-deck').post((req, res, next) => {
        const deckName = req.deckName;
        const deck = new Deck({
            userID: req.userID,
            deckID: new mongoose.Types.ObjectId(),
            deckName: deckName
        });
        deck.save().then(result => {
            console.log(result);
            res.status(201).json({
                message: "Done upload!",
                userCreated: {
                    _id: result._id,
                    avatar: result.avatar
                }
            })
        }).catch(err => {
            console.log(err),
            res.status(500).json({
                error: err
            });
        })
    })

    return router;
};


let express = require('express'),
  multer = require('multer'),
  mongoose = require('mongoose'),
  router = express.Router(),
  config = require('../config');


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

    //upload a multiple files
    router.route('/upload')
        .post(upload.array('file', 60), (req, res, next) => {
            res.status(200).json({
                success: true,
                message: req.files.length + ' file(s) uploaded succesfully',
            });
        });

        //TODO: add functionality for fetching and deleting images
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
                        //TODO: enable the rendering of files to the browser
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

    router.route('/file/:filename').get((req, res, next) => {
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

    return router;
};


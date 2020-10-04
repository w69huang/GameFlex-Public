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

    //upload a multiple files
    router.route('/upload')
        .post(upload.array('file', 60), (req, res, next) => {
            res.status(200).json({
                success: true,
                message: req.files.length + ' file(s) uploaded succesfully',
            });
        });

        //TODO: add functionality for fetching and deleting images

        return router;
};


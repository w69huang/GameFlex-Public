const express = require('express');
const router = express.Router();
const mySQLConnection = require('../database/mysql');
const user = require('../database/models/mysql.user.model');
const multer = require('multer');
const mongoose = require('mongoose');
const config = require('../config');
const fs = require('fs');
const { resolve } = require('path');

const url = config.mongoURI;
    const connect = mongoose.createConnection(url, {useNewUrlParser: true, useUnifiedTopology: true });

    let gfs;

    connect.once('open', () => {
        //initialize Gridfs datastream
        gfs = new mongoose.mongo.GridFSBucket(connect.db, {
            bucketName: "uploads"
        });
    });

router.post('/upload', upload);
router.get('/', files);
router.get('/:filename', singleFile);
router.find('/image/:filename', renderImage);
router.delete('/:filename', deleteFile);
router.post('/new-deck', newDeck);

function upload(request, result) {
}

function files(request, result) {
}

function singleFile(request, result) {
}

function renderImage(request, result) {
}

function deleteFile(request, result) {
}

function newDeck(request, result) {
}
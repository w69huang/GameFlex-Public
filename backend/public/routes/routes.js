let express = require('express'),
    multer = require('multer'),
    mongoose = require('mongoose'),
    const GridFsStorage = require('multer-gridfs-storage'),
    router = express.Router();

const url = 'file.io'

const DIR = './public';

const storage = new GridFsStorage({ 
    url: url,
    file: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        const filename = file.originalname.toLowerCase().split(' ').join('-');
        cb(null, filename)
    }
 });

const upload = multer()

const app = express()
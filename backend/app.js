// ~~~~~~~ Use `nodemon app.js` to start the server ~~~~~~~~~ //

const createError = require('http-errors'),
express = require('express');
const path = require('path');
//const cookieParser = require('cookie-parser');
//const logger = require('morgan');
//const methodOverride = require('method-override'),
config = require('./config');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const crypto = require('crypto');
const cors = require('cors');
const bodyparser = require('body-parser');

//Routes to handle requests
const router = require('../backend/routes/routes');

//TODO: ADD CONFIG FILES. GET FILE UPLOADS WORKING

// The express() library will be used to handle backend routing
const app = express();
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
    extended: false
}));
app.use(cors());

// instantiate our database that was set up and connected in mongoose.js
const mongoose = require('./database/mongoose');
mongoose.Promise = require('bluebird');

const url = config.mongoURI;
const connect = mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true });

connect.then(() => {
    console.log('Connected to database: DeckStorage');
}, (err) => console.log(err));

//GridFS config
// create storage engine
const storage = new GridFsStorage({
    url: config.mongoURI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                //const filename = buf.toString('hex') + path.extname(file.originalname);
                const filename = file.originalname
                // console.log(file.originalname);
                // console.log(buf.toString('hex') + path.extname(file.originalname));
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            });
        });
    }
});

const upload = multer({ storage });

app.use('/', router(upload));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log('Connected to port ' + port)
})

// error handler
app.use((req, res, next) => {
    // Error goes via `next()` method
    setImmediate(() => {
      next(new Error('Something went wrong'));
    });
  });
  
  app.use(function (err, req, res, next) {
    console.error(err.message);
    if (!err.statusCode) err.statusCode = 500;
    res.status(err.statusCode).send(err.message);
});

 
// ~~~~~~~ Use `nodemon app.js` to start the server ~~~~~~~~~ //

const createError = require('http-errors');
const express = require('express');
const config = require('./config');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const crypto = require('crypto');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser') // The body parser will simplify the request data for mysql
const mongoose = require('./database/mongoose')
const mysql_connection = require('./database/mysql')

// The express() library will be used to handle backend routing
const app = express()
const mysqlapp = express()

// Setting up routes that live in different controllers
const onlineGamesRoutes = require('./controllers/online-games.controller');
const userRoutes = require('./controllers/mysql.user.controllers');
const savedGameStateRoutes = require('./controllers/saved-game-state.controller');
const deckEditorRoutes = require('./controllers/deck-editor.controller');
const configurationRoutes = require('./controllers/configuration.controller');
const { fail } = require('assert');


// allows our app to use json data
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false })); // Parses urlencoded bodies
app.use(bodyParser.json()); // Send JSON responses

// Allows use to parse application/json type post data
mysqlapp.use(bodyParser.json());
mysqlapp.use(bodyParser.urlencoded({extended:true}));
mysqlapp.use(cors());




/*
    CORS: Cross-origin resource sharing
    localhost:3000 - back-end api (mongo)
    localhost:4200 - front-end
    localhost:5000 - back-end api (mysql)
    For our back-end, CORS will take any request that comes from ports other than 3000 and reject it
*/

// app.use allows us to create middleware, which in this case will be checking requests and responses
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", '*')
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
})

mysqlapp.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", '*')
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
})

mysqlapp.use('/user', userRoutes);
mysqlapp.use('/online-games', onlineGamesRoutes);
app.use('/saved-game-state', savedGameStateRoutes);
app.use('/deck-editor', deckEditorRoutes);
app.use('/configuration', configurationRoutes);

//GridFS config -- create storage engine
const storage = new GridFsStorage({
    url: config.mongoURI,
    file: (req, file) => {
        console.log(file);
        const filename = file.originalname;
        let fileInfo = {};
        fileInfo = {
            filename: filename,
            bucketName: 'userCards'
        };
        return fileInfo;
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !=='.PNG' && ext !== '.jpg' && ext !== '.jpeg') {
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true)
    },
    limits: {
        fileSize: 1024 * 1024
    }
});
app.use('/', deckEditorRoutes(upload));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

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

 // port number to listen on, callback fxn for when it completes
app.listen(3000, () => console.log("Server Connected on port 3000"));
mysqlapp.listen(5000, () => console.log("Mysql Server Connected on port 5000"));
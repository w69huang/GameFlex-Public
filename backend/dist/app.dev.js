"use strict";

// ~~~~~~~ Use `nodemon app.js` to start the server ~~~~~~~~~ //
var createError = require('http-errors');

var express = require('express');

var config = require('./config');

var multer = require('multer');

var GridFsStorage = require('multer-gridfs-storage');

var crypto = require('crypto');

var cors = require('cors');

var bodyParser = require('body-parser'); // The body parser will simplify the request data for mysql
// instantiate our database that was set up and connected in mongoose.js


var mongoose = require('./database/mongoose');

var mysql_connection = require('./database/mysql'); // The express() library will be used to handle backend routing


var app = express();
var mysqlapp = express(); // Setting up routes that live in different controllers

var deckEditorRoutes = require('./controllers/deck-editor.controller'); // allows our app to use json data


app.use(express.json());
app.use(bodyParser.urlencoded({
  extended: false
})); // Parses urlencoded bodies

app.use(bodyParser.json()); // Send JSON responses
// Allows use to parse application/json type post data

mysqlapp.use(bodyParser.json());
mysqlapp.use(bodyParser.urlencoded({
  extended: true
}));
mysqlapp.use(cors());

var List = require('./database/models/list');

var Task = require('./database/models/task');

var Deck = require('./database/models/deck');

var Counter = require('./database/models/counter');

var user = require('./database/models/mysql.user.model');
/*
    CORS: Cross-origin resource sharing
    localhost:3000 - back-end api (mongo)
    localhost:4200 - front-end
    localhost:5000 - back-end api (mysql)
    For our back-end, CORS will take any request that comes from ports other than 3000 and reject it
*/
// app.use allows us to create middleware, which in this case will be checking requests and responses


app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", '*');
  res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
mysqlapp.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", '*');
  res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use('/deck-editor', deckEditorRoutes); //GridFS config -- create storage engine

var storage = new GridFsStorage({
  url: config.mongoURI,
  file: function file(req, _file) {
    // console.log(req);
    console.log("In the storage engine");
    return new Promise(function (resolve, reject) {
      crypto.randomBytes(16, function (err, buf) {
        if (err) {
          return reject(err);
        }

        var filename = _file.originalname;
        var fileInfo = {}; // if(req.body.deckName) {
        //     fileInfo = {
        //         filename: filename,
        //         bucketName: 'uploads',
        //         deckName: req.body.deckName
        //     };
        // } else { 

        fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        }; // }

        resolve(fileInfo);
      });
    });
  }
});
/*
    List: Create, Update, ReadOne, ReadAll, Delete
    Task: Create, Update, ReadOne, ReadAll, Delete

    We will create a RESTful API to carry these out.
    
    We will begin by creating the URL endpoints.
*/
// List Routes // 
// Express.js implements API calls via their .get, .post, etc methods implemented in the library
// Each method takes in a callback function (what to do upon receiving the request) with two main parameters: req and res
// req = request and allows you to extract data from the request (such as parameters)
// res = response and it implements methods that allow you to reply to the request (such as `send()`)
// put vs patch
// put = used for updating entire collection/document
// patch = used to just update one single field
// http://localhost:3000/lists

app.get('/lists', function (req, res) {
  List.find({}) // get all lists in the mongoDB
  .then(function (lists) {
    return res.send(lists);
  }) // send the lists in the response to the request
  ["catch"](function (error) {
    return console.log(error);
  });
});
app.get('/lists/:listId', function (req, res) {
  // note: `_id` is the auto-generated id for the list
  List.find({
    _id: req.params.listId
  }) // find the list in the mongoDB w/ _id equal to id in parameter (pulled out from req)
  .then(function (list) {
    return res.send(list);
  }) // send the list in the response to the request
  ["catch"](function (error) {
    return console.log(error);
  });
});
app.post('/lists', function (req, res) {
  new List({
    'title': req.body.title
  }).save().then(function (list) {
    return res.send(list);
  }) // send back to user
  ["catch"](function (error) {
    return console.log(error);
  });
});
app.patch('/lists/:listId', function (req, res) {
  // List.findOneAndUpdate will look for a `List` with a parameter of `_id` equal to `req.params.listId`
  // `$set: req.body` will set the parameters of the list according to what was set in the request body - if a title was specified, it'll set the title
  // We could also use findByIdAndUpdate in this scenario
  List.findOneAndUpdate({
    _id: req.params.listId
  }, {
    $set: req.body
  }).then(function (list) {
    return res.send(list);
  })["catch"](function (error) {
    return console.log(error);
  });
});
app["delete"]('/lists/:listId', function (req, res) {
  var deleteTasks = function deleteTasks(list) {
    Task.deleteMany({
      _listId: list._id
    }).then(function () {
      return list;
    })["catch"](function (error) {
      return console.log(error);
    });
  };
});
var upload = multer({
  storage: storage
});
app.use('/', deckEditorRoutes(upload)); // catch 404 and forward to error handler

app.use(function (req, res, next) {
  next(createError(404));
}); // error handler

app.use(function (req, res, next) {
  // Error goes via `next()` method
  setImmediate(function () {
    next(new Error('Something went wrong'));
  });
});
app.use(function (err, req, res, next) {
  console.error(err.message);
  if (!err.statusCode) err.statusCode = 500;
  res.status(err.statusCode).send(err.message);
}); // Task Routes //

app.get('/lists/:listId/tasks', function (req, res) {
  // note: `_listId` is of type `mongoose.Types.ObjectId`
  Task.find({
    _listId: req.params.listId
  }).then(function (tasks) {
    return res.send(tasks);
  })["catch"](function (error) {
    return console.log(error);
  });
});
app.get('/lists/:listId/tasks/:taskId', function (req, res) {
  // note: `_id` is the auto-generated id for the task
  Task.find({
    _listId: req.params.listId,
    _id: req.params.taskId
  }).then(function (task) {
    return res.send(task);
  })["catch"](function (error) {
    return console.log(error);
  });
});
app.post('/lists/:listId/tasks', function (req, res) {
  new Task({
    '_listId': req.params.listId,
    'title': req.body.title
  }).save().then(function (task) {
    return res.send(task);
  })["catch"](function (error) {
    return console.log(error);
  });
});
app.patch('/lists/:listId/tasks/:taskId', function (req, res) {
  Task.findOneAndUpdate({
    _listId: req.params.listId,
    _id: req.params.taskId
  }, {
    $set: req.body
  }).then(function (task) {
    return res.send(task);
  })["catch"](function (error) {
    return console.log(error);
  });
});
app["delete"]('/lists/:listId/tasks/:taskId', function (req, res) {
  Task.findByIdAndDelete({
    _listId: req.params.listId,
    _id: req.params.taskId
  }).then(function (task) {
    return res.send(task);
  })["catch"](function (error) {
    return console.log(error);
  });
}); // MY SQL:

mysqlapp.get('/', function (req, res) {
  res.send("Hello World");
}); // Setting up routes that live in different controllers

var onlineGamesRoutes = require('./controllers/online-games.controller');

var userRoutes = require('./controllers/mysql.user.controllers');

var savedGameStateRoutes = require('./controllers/saved-game-state.controller');

var configurationRoutes = require('./controllers/configuration.controller');

mysqlapp.use('/user', userRoutes);
mysqlapp.use('/online-games', onlineGamesRoutes);
app.use('/saved-game-state', savedGameStateRoutes);
app.use('/configuration', configurationRoutes); // port number to listen on, callback fxn for when it completes

app.listen(3000, function () {
  return console.log("Server Connected on port 3000");
});
mysqlapp.listen(5000, function () {
  return console.log("Mysql Server Connected on port 5000");
});
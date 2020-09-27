"use strict";

// ~~~~~~~ Use `nodemon app.js` to start the server ~~~~~~~~~ //
var express = require('express'); // The body parser will simplify the request data for mysql


var bodyParser = require('body-parser'); // The express() library will be used to handle backend routing


var app = express();
var mysqlapp = express();

var cors = require('cors'); // allows our app to use json data


app.use(express.json()); // Allows use to parse application/json type post data

mysqlapp.use(bodyParser.json());
mysqlapp.use(bodyParser.urlencoded({
  extended: true
})); // mysqlapp.use(cors());
// instantiate our database that was set up and connected in mongoose.js

var mongoose = require('./database/mongoose');

var mysql_connection = require('./database/mysql');

var List = require('./database/models/list');

var Task = require('./database/models/task');

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

  List.findByIdAndDelete(req.params.listId).then(function (list) {
    return res.send(deleteTasks(list));
  })["catch"](function (error) {
    return console.log(error);
  });
}); // Now for tasks. Since each task has to be associated with at least one list, our url will look something like:
// http://localhost:3000/lists/:listId/tasks/:taskId
// Task Routes //

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
}); // const userRoutes = require('./routes/mysql.user.routes')

var userRoutes = require('./controller/mysql.user.controller');

mysqlapp.use('/user', userRoutes); // port number to listen on, callback fxn for when it completes

app.listen(3000, function () {
  return console.log("Server Connected on port 3000");
});
mysqlapp.listen(5000, function () {
  return console.log("Mysql Server Connected on port 5000");
});
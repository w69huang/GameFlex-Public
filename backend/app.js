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

const port = process.env.PORT || 4000;
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

//module.exports = app;
// port number to listen on, callback fxn for when it completes
// app.listen(3000, () => console.log("Server Connected on port 3000"))

// const List = require('./database/models/list')
// const Task = require('./database/models/task')

// /*
//     CORS: Cross-origin resource sharing
//     localhost:3000 - back-end api
//     localhost:4200 - front-end

//     For our back-end, CORS will take any request that comes from ports other than 3000 and reject it
// */

// // app.use allows us to create middleware, which in this case will be checking requests and responses
// app.use((req, res, next) => {
//     res.header("Access-Control-Allow-Origin", '*')
//     res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE")
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
//     next()
// })

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
// app.get('/lists', (req, res) => {
//     List.find({}) // get all lists in the mongoDB
//         .then(lists => res.send(lists)) // send the lists in the response to the request
//         .catch((error) => console.log(error))
// }) 

// app.get('/lists/:listId', (req, res) => {
//     // note: `_id` is the auto-generated id for the list
//     List.find({ _id: req.params.listId }) // find the list in the mongoDB w/ _id equal to id in parameter (pulled out from req)
//         .then((list) => res.send(list)) // send the list in the response to the request
//         .catch((error) => console.log(error))
// })

// app.post('/lists', (req, res) => {
//     (new List({'title': req.body.title}))
//         .save()
//         .then((list) => res.send(list)) // send back to user
//         .catch((error) => console.log(error))
// })

// app.patch('/lists/:listId', (req, res) => {
//     // List.findOneAndUpdate will look for a `List` with a parameter of `_id` equal to `req.params.listId`
//     // `$set: req.body` will set the parameters of the list according to what was set in the request body - if a title was specified, it'll set the title
//     // We could also use findByIdAndUpdate in this scenario
//     List.findOneAndUpdate({ _id: req.params.listId }, { $set: req.body }) 
//         .then((list) => res.send(list))
//         .catch((error) => console.log(error))
// })

// app.delete('/lists/:listId', (req, res) => {
//     const deleteTasks = (list) => {
//         Task.deleteMany({_listId: list._id})
//             .then(() => list)
//             .catch((error) => console.log(error))
//     }
//     List.findByIdAndDelete(req.params.listId)
//         .then((list) => res.send(deleteTasks(list)))
//         .catch((error) => console.log(error))

// })

// Now for tasks. Since each task has to be associated with at least one list, our url will look something like:
// http://localhost:3000/lists/:listId/tasks/:taskId

// Task Routes //

// app.get('/lists/:listId/tasks', (req, res) => {
//     // note: `_listId` is of type `mongoose.Types.ObjectId`
//     Task.find({ _listId: req.params.listId })
//         .then((tasks) => res.send(tasks)) 
//         .catch((error) => console.log(error))
// })

// app.get('/lists/:listId/tasks/:taskId', (req, res) => {
//     // note: `_id` is the auto-generated id for the task
//     Task.find({ _listId: req.params.listId, _id: req.params.taskId })
//         .then((task) => res.send(task)) 
//         .catch((error) => console.log(error))
// })

// app.post('/lists/:listId/tasks', (req, res) => {
//     (new Task({ '_listId': req.params.listId, 'title': req.body.title }))
//         .save()
//         .then((task) => res.send(task)) 
//         .catch((error) => console.log(error))
// })

// app.patch('/lists/:listId/tasks/:taskId', (req, res) => {
//     Task.findOneAndUpdate({ _listId: req.params.listId, _id: req.params.taskId }, { $set: req.body })
//         .then((task) => res.send(task)) 
//         .catch((error) => console.log(error))
// })

// app.delete('/lists/:listId/tasks/:taskId', (req, res) => {
//     Task.findByIdAndDelete({ _listId: req.params.listId, _id: req.params.taskId })
//         .then((task) => res.send(task)) 
//         .catch((error) => console.log(error))
// })

 
// ~~~~~~~ Use `nodemon app.js` to start the server ~~~~~~~~~ //

const express = require('express')

// The body parser will simplify the request data for mysql
const bodyParser = require('body-parser')

// The express() library will be used to handle backend routing
const app = express()
const mysqlapp = express()
const cors = require('cors')
// allows our app to use json data
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false })); // Parses urlencoded bodies
app.use(bodyParser.json()); // Send JSON responses

// Allows use to parse application/json type post data
mysqlapp.use(bodyParser.json());
mysqlapp.use(bodyParser.urlencoded({ extended: true }));

// instantiate our database that was set up and connected in mongoose.js
const mongoose = require('./database/mongoose')
const mysql_connection = require('./database/mysql')

const List = require('./database/models/list')
const Task = require('./database/models/task')
const Configuration = require('./database/models/configuration')
const Deck = require('./database/models/deck')
const Counter = require('./database/models/counter')
const user = require('./database/models/mysql.user.model')

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
app.get('/lists', (req, res) => {
    List.find({}) // get all lists in the mongoDB
        .then(lists => res.send(lists)) // send the lists in the response to the request
        .catch((error) => console.log(error))
})

app.get('/lists/:listId', (req, res) => {
    // note: `_id` is the auto-generated id for the list
    List.find({ _id: req.params.listId }) // find the list in the mongoDB w/ _id equal to id in parameter (pulled out from req)
        .then((list) => res.send(list)) // send the list in the response to the request
        .catch((error) => console.log(error))
})

app.post('/lists', (req, res) => {
    (new List({ 'title': req.body.title }))
        .save()
        .then((list) => res.send(list)) // send back to user
        .catch((error) => console.log(error))
})

app.patch('/lists/:listId', (req, res) => {
    // List.findOneAndUpdate will look for a `List` with a parameter of `_id` equal to `req.params.listId`
    // `$set: req.body` will set the parameters of the list according to what was set in the request body - if a title was specified, it'll set the title
    // We could also use findByIdAndUpdate in this scenario
    List.findOneAndUpdate({ _id: req.params.listId }, { $set: req.body })
        .then((list) => res.send(list))
        .catch((error) => console.log(error))
})

app.delete('/lists/:listId', (req, res) => {
    const deleteTasks = (list) => {
        Task.deleteMany({ _listId: list._id })
            .then(() => list)
            .catch((error) => console.log(error))
    }
    List.findByIdAndDelete(req.params.listId)
        .then((list) => res.send(deleteTasks(list)))
        .catch((error) => console.log(error))

})

// Now for tasks. Since each task has to be associated with at least one list, our url will look something like:
// http://localhost:3000/lists/:listId/tasks/:taskId

// Task Routes //

app.get('/lists/:listId/tasks', (req, res) => {
    // note: `_listId` is of type `mongoose.Types.ObjectId`
    Task.find({ _listId: req.params.listId })
        .then((tasks) => res.send(tasks))
        .catch((error) => console.log(error))
})

app.get('/lists/:listId/tasks/:taskId', (req, res) => {
    // note: `_id` is the auto-generated id for the task
    Task.find({ _listId: req.params.listId, _id: req.params.taskId })
        .then((task) => res.send(task))
        .catch((error) => console.log(error))
})

app.post('/lists/:listId/tasks', (req, res) => {
    (new Task({ '_listId': req.params.listId, 'title': req.body.title }))
        .save()
        .then((task) => res.send(task))
        .catch((error) => console.log(error))
})

app.patch('/lists/:listId/tasks/:taskId', (req, res) => {
    Task.findOneAndUpdate({ _listId: req.params.listId, _id: req.params.taskId }, { $set: req.body })
        .then((task) => res.send(task))
        .catch((error) => console.log(error))
})

app.delete('/lists/:listId/tasks/:taskId', (req, res) => {
    Task.findByIdAndDelete({ _listId: req.params.listId, _id: req.params.taskId })
        .then((task) => res.send(task))
        .catch((error) => console.log(error))
})

// Configuration Routes //

app.get('/configeditor/:configurationId', (req, res) => {
    // note: `_id` is the auto-generated id for the task
    Configuration.findOne({ _id: req.params.configurationId })
        .then((configuration) => {
            res.send(configuration)
            console.log('the config is: ', configuration, ' end test') //TODO remove console log
        })
        .catch((error) => console.log(error))
    console.log('Config Get Backend has run!', req.params.configurationId);
})

app.post('/configeditor', (req, res) => {
    console.log('The req.body line: ', req.body);
    newConfig = new Configuration({ 'userId': req.body.configuration.userId, 'numPlayers': req.body.configuration.numPlayers, handsVisibleOnInsert: req.body.configuration.handsVisibleOnInsert, 'decks': req.body.configuration.decks, 'counters': [] });
    console.log('The new config line: ', newConfig);
    (newConfig)
        .save()
        .then((configuration) => {
            res.send(configuration);
            console.log('The then line: ', configuration);
        })
        .catch((error) => console.log(error))
    console.log('Config Post Backend has run!');
})

app.patch('/configeditor/:configurationId', (req, res) => {
    Configuration.findOneAndUpdate({ _id: req.params.configurationId }, { $set: req.body.configuration })
        .then((configuration) => res.send(configuration))
        .catch((error) => console.log(error))
    console.log('Config Patch/Update Backend has run!');
})

app.delete('/configeditor/:configurationId', (req, res) => {
    Configuration.findByIdAndDelete({ _id: req.params.configurationId })
        .then((configuration) => res.send(configuration))
        .catch((error) => console.log(error))
    console.log('Config Delete Backend has run!');
})

// MY SQL:
mysqlapp.get('/', (req, res) => {
    res.send("Hello World");
});

// Setting up routes that live in different controllers

const onlineGamesRoutes = require('./controllers/online-games.controller');
const userRoutes = require('./controllers/mysql.user.controllers');
const savedGameStateRoutes = require('./controllers/saved-game-state.controller');
mysqlapp.use('/user', userRoutes)
mysqlapp.use('/online-games', onlineGamesRoutes);
app.use('/saved-game-state', savedGameStateRoutes);

// port number to listen on, callback fxn for when it completes
app.listen(3000, () => console.log("Server Connected on port 3000"));
mysqlapp.listen(5000, () => console.log("Mysql Server Connected on port 5000"));

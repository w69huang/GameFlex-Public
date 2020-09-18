// Will configure out db and return our mongoose objects

const mongoose = require('mongoose')

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://127.0.0.1:27017/test-app', { 
                useNewUrlParser: true, 
                useUnifiedTopology: true, 
                useFindAndModify: false,
                promiseLibrary: require('bluebird'),
                useCreateIndex: true
         }).then(() => console.log('Database Connected'))
        .catch((error) => console.log(error))

module.exports = mongoose
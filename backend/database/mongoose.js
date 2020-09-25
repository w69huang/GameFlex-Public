// Will configure out db and return our mongoose objects

const mongoose = require('mongoose')

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://35.215.71.108:27017/test-app', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
        .then(() => console.log('Database Connected'))
        .catch((error) => console.log(error))

module.exports = mongoose
const mongoose = require('mongoose')

// Create the schema

// Takes in an object equal to the def of our schema
const ListSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        minlength: 3
    }
})

// Create the model
const List = mongoose.model('List', ListSchema)


// Export the model
module.exports = List
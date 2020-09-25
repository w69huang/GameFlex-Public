const mongoose = require('mongoose')

// Create the schema

// Takes in an object equal to the def of our schema
const CardSchema = new mongoose.Schema({
    name: String,
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    rotation: Number,
    onInsertVisible: Boolean,
    type: String,
    visibleTo: Array

})

const Card = mongoose.model('Card', CardSchema)

module.exports = Card;

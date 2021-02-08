const mongoose = require('mongoose')

// Create the schema

// Takes in an object equal to the def of our schema
const CardSchema = new mongoose.Schema({
    id: String,
    imagePath: String,
    x: Number,
    y: Number,
    flippedOver: Boolean,
    depth: Number,
    base64: Boolean,
    deckName: String
});

const Card = mongoose.model('Card', CardSchema);

module.exports = Card;

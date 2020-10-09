const mongoose = require('mongoose');
const Card = require('./card').schema;

// Create the schema

// Takes in an object equal to the def of our schema
const DeckSchema = new mongoose.Schema({
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    rotation: Number,
    onInsertVisible: Boolean,
    numberOfVisibleCards: Number,
    //cards: [Card]
})

const Deck = mongoose.model('Deck', DeckSchema)

module.exports = Deck;

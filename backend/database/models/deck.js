const mongoose = require('mongoose');
const Card = require('./card').schema;

// Create the schema

// Takes in an object equal to the def of our schema
const DeckSchema = new mongoose.Schema({
    id: Number,
    imagePath: String,
    x: Number,
    y: Number,
    depth: Number,
    cardMins: [Card],
});

const Deck = mongoose.model('Deck', DeckSchema);

module.exports = Deck;

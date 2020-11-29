const mongoose = require('mongoose');
const Counter = require('./counter').schema;
const Deck = require('./deck').schema;

// Create the schema

// Takes in an object equal to the def of our schema
const ConfigurationSchema = new mongoose.Schema({
    username: {
        type: String,
    },
    name: {
        type: String,
    },
    date: Date,
    numPlayers: {
        type: Number,
        default: 0
    },
    handsVisibleOnInsert: {
        type: Boolean,
        default: false
    },
    decks: {
        type: [Deck]
    },
    counters: [Counter]
})

const Configuration = mongoose.model('Configuration', ConfigurationSchema)

module.exports = Configuration;

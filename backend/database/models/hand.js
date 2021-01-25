const mongoose = require('mongoose');
const Card = require('./card').schema;

// Create the schema

// Takes in an object equal to the def of our schema
const HandSchema = new mongoose.Schema({
    playerID: Number,
    cardMins: [Card],
});

const Hand = mongoose.model('Hand', HandSchema);

module.exports = Hand;
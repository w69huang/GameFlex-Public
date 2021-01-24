const mongoose = require('mongoose');
const Counter = require('./counter').schema;
const Card = require('./card').schema;
const Deck = require('./deck').schema;
const Hand = require('./hand').schema;
const SavedPlayerData = require('./savedPlayerData').schema;

const SavedGameStateSchema = new mongoose.Schema({
    username: {
        type: String,
        minlength: 3
    },
    name: {
        type: String,
        minlength: 3
    },
    date: Date,
    cardMins: [Card],
    deckMins: [Deck],
    handMins :[ 
        {
            playerID: Number,
            innerHandMins: [Hand]
        },
    ],
    counters: [Counter],
    savedPlayerData: [SavedPlayerData],
})

const SavedGameState = mongoose.model('SavedGameState', SavedGameStateSchema)

module.exports = SavedGameState;
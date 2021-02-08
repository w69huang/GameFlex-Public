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
    base64Decks : [
        {
            deck: String
        } 
    ],
    deckMins: [
        // {
        //     id: Number,
        //     imagePath: String,
        //     x: Number,
        //     y: Number,
        //     depth: Number,
        //     cardMins: [
        //         {
        //             id: Number,
        //             imagePath: String,
        //             x: Number,
        //             y: Number,
        //             flippedOver: Boolean,
        //             depth: Number
        //         }
        //     ]
        // }
        Deck
    ],
    handMins : [ 
        {
        playerID: Number,
        innerHandMins: [
                // { //handMin
                //     playerID: Number,
                //     cardMins: [
                //         {
                //             // id: Number,
                //             id: String,
                //             imagePath: String,
                //             x: Number,
                //             y: Number,
                //             flippedOver: Boolean,
                //             depth: Number,
                //             base64: Boolean,
                //             deckName: String,
            
                //         }
                //     ]
                // }
                Hand
            ]
        },
    ],
    counters: [Counter],
    savedPlayerData: [SavedPlayerData],
})

const SavedGameState = mongoose.model('SavedGameState', SavedGameStateSchema)

module.exports = SavedGameState;
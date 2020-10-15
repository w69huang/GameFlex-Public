const mongoose = require('mongoose')

const SavedGameStateSchema = new mongoose.Schema({
    id: Number,
    name: {
        type: String,
        minlength: 3
    },
    date: Date,
    cardMins: [
        {
            id: Number,
            imagePath: String,
            x: Number,
            y: Number
        }
    ],
    deckMins: [
        {
            id: Number,
            imagePath: String,
            x: Number,
            y: Number
        }
    ],
    handMins: [
        {
            playerID: Number,
            cardMins: [
                {
                    id: Number,
                    imagePath: String,
                    x: Number,
                    y: Number
                }
            ], 
        }
    ],
    savedPlayerData: [
        {
            playerID: Number,
            username: String
        }
    ]
})

const SavedGameState = mongoose.model('SavedGameState', SavedGameStateSchema)

module.exports = SavedGameState
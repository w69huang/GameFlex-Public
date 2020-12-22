const mongoose = require('mongoose')

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
    cardMins: [
        {
            id: Number,
            imagePath: String,
            x: Number,
            y: Number,
            depth: Number
        }
    ],
    deckMins: [
        {
            id: Number,
            imagePath: String,
            x: Number,
            y: Number,
            depth: Number,
            cardMins: [
                {
                    id: Number,
                    imagePath: String,
                    x: Number,
                    y: Number,
                    depth: Number
                }
            ]
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
                    y: Number,
                    depth: Number
                }
            ]
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
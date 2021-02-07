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
            // id: Number,
            id: String,
            imagePath: String,
            x: Number,
            y: Number,
            flippedOver: Boolean,
            depth: Number,
            base64: Boolean,
            deckName: String,

        }
    ],
    base64Decks : [
        {
            deck: String
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
                    flippedOver: Boolean,
                    depth: Number
                }
            ]
        }
    ],
    handMins : [ 
        {
        playerID: Number,
        innerHandMins: [
                { //handMin
                    playerID: Number,
                    cardMins: [
                        {
                            // id: Number,
                            id: String,
                            imagePath: String,
                            x: Number,
                            y: Number,
                            flippedOver: Boolean,
                            depth: Number,
                            base64: Boolean,
                            deckName: String,
            
                        }
                    ]
                }
            ]
        },
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
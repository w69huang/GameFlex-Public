const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let deck = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    avatar: {
        type: Array
    },
}, { 
    collection: 'decks'
})

module.exports = mongoose.model('Card', cardSchema)

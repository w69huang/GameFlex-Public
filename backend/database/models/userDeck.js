const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserDeck = new mongoose.Schema({
    userID: mongoose.Schema.Types.ObjectId,
    deckID: mongoose.Schema.Types.ObjectId,
    deckName: {type: String},
    imageID: {type: Array},
});

module.exports = mongoose.model('Deck', UserDeck)
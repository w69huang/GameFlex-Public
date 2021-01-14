const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserDeck = new mongoose.Schema({
    userID: {type: String },
    deckID: {type: String },
    deckName: {type: String},
    imageID: {type: Array},
});

module.exports = mongoose.model('UserDeck', UserDeck)
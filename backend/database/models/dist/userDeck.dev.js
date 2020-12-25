"use strict";

var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var UserDeck = new mongoose.Schema({
  userID: {
    type: String
  },
  deckID: {
    type: String
  },
  deckName: {
    type: String
  },
  imageID: {
    type: Array
  }
});
module.exports = mongoose.model('userDeck', UserDeck); // module.exports = UserDeck;
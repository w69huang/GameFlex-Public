const mongoose = require('mongoose')

// Create the schema

// Takes in an object equal to the def of our schema
const SavedPlayerDataSchema = new mongoose.Schema({
    playerID: Number,
    username: String
});

const SavedPlayerData = mongoose.model('SavedPlayerData', SavedPlayerDataSchema);

module.exports = SavedPlayerData;
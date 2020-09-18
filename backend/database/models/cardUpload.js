const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let cardSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    avatar: {
        type: Array
    },
}, { 
    collection: 'cards'
})

module.exports = mongoose.model('Card', cardSchema)

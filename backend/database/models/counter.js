const mongoose = require('mongoose')

// Create the schema

// Takes in an object equal to the def of our schema
const CounterSchema = new mongoose.Schema({
    name: String,
    currentValue: Number,
    maxValue: Number,
    minValue: Number,
    increment: Number,
    x: Number,
    y: Number,
    width: Number,
    height: Number
})

const Counter = mongoose.model('Counter', CounterSchema)

module.exports = Counter;

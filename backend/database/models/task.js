const mongoose = require('mongoose')

// Create the schema

// Takes in an object equal to the def of our schema
const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        minlength: 3
    },
    _listId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    completed: {
        type: Boolean,
        default: false,
        required: true
    }
})

const Task = mongoose.model('Task', TaskSchema)

module.exports = Task;

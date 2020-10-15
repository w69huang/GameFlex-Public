const express = require('express');
const router = express.Router();
const mysql_connection = require('../database/mysql');

const SavedGameState = require('../database/models/savedGameState');

router.get('/getAll', getAll);
router.post('/post', create);
router.delete('/delete', deleteAll);
router.patch('/patch', update);

function getAll(request, result) {
   SavedGameState.find({})
                 .then((savedGameStates) => result.send(savedGameStates))
                 .catch((error) => console.log(error));
}

function create(request, result) {
    var savedGameState = request.body;    
    
    (new SavedGameState({ 'id': savedGameState.id, 'name': savedGameState.name, 'date': savedGameState.date, 'cardMins': savedGameState.cardMins, 'deckMins': savedGameState.deckMins, 'handMins': savedGameState.handMins, 'savedPlayerData': savedGameState.savedPlayerData}))
        .save()
        .then((savedGameState) => result.send(savedGameState))
        .catch((error) => console.log(error));
}

function deleteAll(request, result) {
    
}

function update(request, result) {
    
}

module.exports = router;
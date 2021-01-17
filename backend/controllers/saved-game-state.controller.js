const express = require('express');
const router = express.Router();
const mySQLConnection = require('../database/mysql');
const user = require('../database/models/mysql.user.model');

const SavedGameState = require('../database/models/savedGameState');

router.get('/getAll', getAll);
router.post('/post', create);
router.delete('/delete', deleteAll);
router.patch('/patch', update);

function getAll(request, result) {
    user.getUser(request.query.username, function(err, user) {
        if (err) {
            result.send(err);
        } else {
            if (user[0] != undefined && request.query.password === user[0].password) {
                SavedGameState.find({ username: request.query.username })
                .then((savedGameStates) => result.send(savedGameStates))
                .catch((error) => console.log(error));
            } 
        }
    });
}

function create(request, result) {
    user.getUser(request.query.username, function(err, user) {
        if (err) {
            result.send(err);
        } else {
            if (user[0] != undefined) {
                if (request.query.password == user[0].password) {
                    var savedGameState = request.body;    
    
                    (new SavedGameState({ 'username': savedGameState.username, 'name': savedGameState.name, 'date': savedGameState.date, 'cardMins': savedGameState.cardMins, 'deckMins': savedGameState.deckMins, 'handMins': savedGameState.handMins, 'savedPlayerData': savedGameState.savedPlayerData}))
                        .save()
                        .then((savedGameState) => result.send(savedGameState))
                        .catch((error) => console.log(error));
                }
            } 
        }
    });
}

function deleteAll(request, result) {
    SavedGameState.deleteMany()
        .then(() => console.log("Deleted all saved games."))
        .catch((error) => console.log(error));
}

function update(request, result) {
    
}

module.exports = router;
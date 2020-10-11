const express = require('express');
const router = express.Router();
const mysql_connection = require('../database/mysql');

router.get('/get', get);
router.get('/getAll', getAll);
router.post('/post', create);
router.delete('/delete', deleteAll);
router.patch('/patch', update);

setInterval(deleteOfflineGames, 60000);

function get(request, result) {
    var onlineGameID = request.query['id'];
    console.log(`onlineGameID: ${onlineGameID}`);
    mysql_connection.query("SELECT * FROM OnlineGameMySQL WHERE id=" + onlineGameID, function(err, res) {
        if (err) {
            console.log("Error in get for online games: ", err);
            result.send(err);
        } else {
            console.log("Successfully retrieved online game.");
            console.log(res);
            result.send(res);
        }
    });
}

function getAll(request, result) {
    mysql_connection.query("SELECT * FROM OnlineGameMySQL", function(err, res) {
        if (err) {
            console.log("Error in getAll for online games: ", err);
            result.send(err);
        } else {
            console.log("Successfully retrieved all online games.");
            console.log(res);
            result.send(res);
        }
    });
}

function create(request, result) {
    var onlineGame = request.body;    
    // TODO: ADD VALIDATION!

    mysql_connection.query("INSERT INTO OnlineGameMySQL SET ?", onlineGame, function (err, res) {
        if (err) {
            console.log("Error in create for online games: ", err);
            result.send(err);
        } else {
            console.log("Successfully inserted a new online game.");
            console.log(res);
            result.send(res);
        }
    });
}

function deleteAll(request, result) {
    mysql_connection.query("DELETE FROM OnlineGameMySQL", function(err, res) {
        if (err) {
            console.log("Error in deleteAll for online games: ", err);
            result.send(err);
        } else {
            console.log("Successfully deleted all online games.");
            console.log(res);
            result.send(res);
        }
    });
}

function update(request, result) {
    var onlineGame = request.body[0];  
    onlineGame.lastUpdated = Date.now();
    mysql_connection.query("UPDATE OnlineGameMySQL SET ? WHERE id=" + onlineGame.id, onlineGame, function (err, res) {
        if (err) {
            console.log("Error in update of online games: ", err);
            result.send(err);
        } else {
            console.log("Successfully updated online game.");
            console.log(res);
            result.send(res);
        }
    });
}

function deleteOfflineGames() {
    // 10 minute (600000 ms) expiry time
    mysql_connection.query("DELETE FROM OnlineGameMySQL WHERE lastUpdated<" + (Date.now() - 600000), function(err, res) {
        if (err) {
            console.log("Error in deleteOfflineGames for online games: ", err);
        } else {
            console.log("Successfully deleted inactive online games.");
            console.log(res);
        }
    });
}

module.exports = router;
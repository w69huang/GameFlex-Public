const express = require('express');
const router = express.Router();
const mysql_connection = require('../database/mysql');

router.get('/get', get);
router.get('/getAll', getAll);
router.get('/getIDAndCode', getIDAndCode);
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

function generateRandomString (length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function getIDAndCode(request, result) {
    console.log("In getIDAndCode!");
    mysql_connection.query("SELECT * FROM OnlineGameMySQL", function(err, res) {
        if (err) {
            console.log("Error in getIDAndCode for online games: ", err);
            result.send(err);
        } else {
            let object = {
                id: 0,
                onlineGameCode: ""
            };
            if (res.length < 1) {
                object.id = "1";
            } else {
                object.id = (parseInt(res[res.length - 1].id) + 1).toString();
            }

            let finished = false;
            while (!finished) {
                let codeMatch = true;
                let code = generateRandomString(6);
                for (let i = 0; i < res.length; i++) {
                    if (res[i].onlineGameCode === code) {
                        codeMatch = false;
                        break;
                    }
                }
                if (codeMatch) {
                    finished = true;
                    object.onlineGameCode = code;
                }
            }
            console.log("Successfully generated new ID and code");
            console.log(object);
            result.send(object);
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
    var onlineGame = request.body;  
    console.log(onlineGame);
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
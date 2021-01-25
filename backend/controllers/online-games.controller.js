const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const mysql_connection = require('../database/mysql');
const user = require('../database/models/mysql.user.model');

router.get('/get', get);
router.get('/getAll', getAll);
router.get('/getIDAndCode', getIDAndCode);
router.post('/post', create);
router.post('/verify', verify);
router.post('/joinByCode', joinByCode);
router.delete('/delete', deleteAll);
router.patch('/update', update);

deleteOfflineGames(); // Do a delete upon initialization to clear out old games
setInterval(deleteOfflineGames, 60000);

function get(request, result) {
    var onlineGameID = request.query['id'];
    mysql_connection.query("SELECT * FROM OnlineGameMySQL WHERE id=" + onlineGameID, function(err, res) {
        if (err) {
            console.log("Error in get for online games: ", err);
            result.send(err);
        } else {
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
            let onlineGames = res.filter(onlineGame => !onlineGame.privateGame); // Private games will have a game code and should not appear in the game browser
            onlineGames.forEach((onlineGame) => {
                onlineGame.hostID = ""; // Do not send Host IDs to the frontend
                onlineGame.encryptedPassword = ""; // No need to send encrypted passwords either
                onlineGame.onlineGameCode = ""; // Also no need for online game codes in the game browser list
            });
            result.send(onlineGames);
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

function joinByCode(request, result) {
    mysql_connection.query(`SELECT * FROM OnlineGameMySQL WHERE onlineGameCode='${request.body.onlineGameCode}'`, function (err, res) {
        if (err) {
            console.log("Error in joinByCode for online games: ", err);
            result.send(err);
        } else {
            if (res.length != 1) {
                if (res.length === 0) {
                    result.send({ message: "No active game with that code." });
                } else {
                    result.send({ message: "Error: More than one matching game with that code." });
                }
            } else {
                const onlineGame = res[0];

                if (onlineGame.numPlayers < onlineGame.maxPlayers) {
                    result.send(onlineGame);
                } else {
                    result.send({ message: "Room is full." });
                }
            }
        }
    });
}

function getIDAndCode(request, result) {
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
            console.log("Successfully generated new ID and code.");
            console.log(object);
            result.send(object);
        }
    });
}

function create(request, result) {
    // TODO: ADD VALIDATION!

    var onlineGame = request.body;
    if (onlineGame.encryptedPassword != "") {
        const hash = crypto.createHash('sha256');
        onlineGame.encryptedPassword = hash.update(onlineGame.encryptedPassword).digest('hex');
    }

    mysql_connection.query("INSERT INTO OnlineGameMySQL SET ?", onlineGame, function (err, res) {
        if (err) {
            console.log("Error in create for online games: ", err);
            result.send(err);
        } else {
            console.log("Successfully inserted a new online game.");
            result.send(res);
        }
    });
}

function verify(request, result) {
    const reqOnlineGame = request.body.onlineGame;
    const reqOnlineGameID = reqOnlineGame.id;
    mysql_connection.query("SELECT * FROM OnlineGameMySQL WHERE id=" + reqOnlineGameID, function(err, res) {
        if (err) {
            console.log("Error in verifyGamePassword for online games: ", err);
            result.send(err);
        } else {
            if (res.length != 1) {
                if (res.length === 0) {
                    result.send({ message: "Error: game does not exist." });
                } else {
                    result.send({ message: "Error: more than one matching game." });
                }
            } else {
                const onlineGame = res[0];
                const accountUsername = request.body.accountUsername;
                const accountPassword = request.body.accountPassword;

                user.getUser(accountUsername, function(error, user) {
                    if (error) {
                        result.send(error);
                    } else {
                        if (user[0] != undefined && accountPassword === user[0].password && accountUsername === user[0].username) {
                            if (user[0].username === onlineGame.username) {
                                result.send({ hostID: onlineGame.hostID });   
                            } else {
                                if (onlineGame.numPlayers >= onlineGame.maxPlayers) {
                                    result.send({ message: "Room is full."});
                                } else {
                                    let hashedPassword = "";
                                    if (request.body.password != "") {
                                        const hash = crypto.createHash('sha256');
                                        hashedPassword = hash.update(request.body.password).digest('hex');
                                    } 
                                    if (hashedPassword === onlineGame.encryptedPassword) {
                                        result.send({ hostID: onlineGame.hostID });
                                    } else {
                                        result.send({ message: "Password incorrect." });
                                    }
                                }
                            }
                        }
                    }
                });
            }
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
            result.send(res);
        }
    });
}

function update(request, result) {
    const onlineGame = request.body.onlineGame;
    const accountUsername = request.body.accountUsername;
    const accountPassword = request.body.accountPassword;
    user.getUser(accountUsername, function(error, user) {
        if (error) {
            result.send(error);
        } else {
            if (user[0] != undefined && accountPassword === user[0].password && accountUsername === onlineGame.username) {
                mysql_connection.query("UPDATE OnlineGameMySQL SET ? WHERE id=" + onlineGame.id, onlineGame, function (err, res) {
                    if (err) {
                        console.log("Error in update of online game: ", err);
                        result.send(err);
                    } else {
                        result.send(res);
                    }
                });
            } 
        }
    });
}

function deleteOfflineGames() {
    // 10 minute (600000 ms) expiry time
    mysql_connection.query("DELETE FROM OnlineGameMySQL WHERE lastUpdated<" + (Date.now() - 600000), function(err, res) {
        if (err) {
            console.log("Error in deleteOfflineGames for online games: ", err);
        }
    });
}

module.exports = router;
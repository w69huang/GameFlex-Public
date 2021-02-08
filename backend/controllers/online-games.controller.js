const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const mysql_connection = require('../database/mysql');
const user = require('../database/models/mysql.user.model');

router.get('/get', get);
router.get('/getAll', getAll);
router.get('/getIDAndCode', getIDAndCode);
router.get('/getHash', getHash);
router.get('/checkHash', checkHash);
router.post('/post', create);
router.post('/joinByCode', joinByCode);
router.delete('/delete', deleteAll);
router.patch('/update', update);

deleteOfflineGames(); // Do a delete upon initialization to clear out old games
setInterval(deleteOfflineGames, 60000);

function generateRandomString (length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

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
                onlineGame.encryptedPassword = ""; // No need to send encrypted passwords either
                onlineGame.onlineGameCode = ""; // Also no need for online game codes in the game browser list
            });
            result.send(onlineGames);
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

function getHash(request, result) {
    const onlineGameID = request.query.onlineGameID;
    const gamePassword = request.query.gamePassword;

    mysql_connection.query("SELECT * FROM OnlineGameMySQL WHERE id=" + onlineGameID, function(err, res) {
        if (err) {
            console.log("Error in getHash for online games: ", err);
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
                if (onlineGame.numPlayers >= onlineGame.maxPlayers) {
                    result.send({ message: "Room is full." })
                }
                else if (onlineGame.encryptedPassword !== "" && onlineGame.encryptedPassword !== crypto.createHash('sha256').update(gamePassword).digest('hex')) {
                    result.send({ message: "Provided password does not match room password." });
                } else {
                    mysql_connection.query("SELECT * FROM OnlineGameHashes WHERE onlineGameID=" + onlineGame.id, function (err2, res2) {
                        const onlineGameHashes = res2;
                        console.log(onlineGameHashes);
                        let numIterations = 0;
                        let foundHash = true;
                        let hash = "";
                        while (numIterations < 1000) {
                            foundHash = true;
                            hash = crypto.createHash('sha256').update(Date.now().toLocaleString() + Math.floor(Math.random()*1000000).toString()).digest('hex');
                            for (let i = 0; i < onlineGameHashes.length; i++) {
                                if (onlineGameHashes[i].hash === hash) {
                                    foundHash = false;
                                    break;
                                }
                            }
                            if (foundHash) {
                                break;
                            }
                            numIterations++;
                        }
                        if (numIterations >= 1000) {
                            result.send({ message: "Error: a valid hash was unable to be generated." });
                        } else {
                            mysql_connection.query(`INSERT INTO OnlineGameHashes (onlineGameID, hash) VALUES (${onlineGame.id},'${hash}')`, function (err3, res3) {
                                if (err3) {
                                    result.send({ message: "Error: unable to insert hash into OnlineGameHashes table." });
                                } else {
                                    result.send({ hash: hash });
                                }
                            });
                        }
                    });
                }
            }
        }
    });
}

function checkHash(request, result) {
    onlineGameID = request.query.onlineGameID;
    hash = request.query.hash;

    mysql_connection.query(`SELECT * from OnlineGameHashes WHERE onlineGameID=${onlineGameID} AND hash=${hash}`, function (err, res) {
        if (err) {
            result.send({ message: "Error: query to DB for the hash failed."});
        } else {
            if (res.length != 1) {
                result.send({ message: "Error: hash not found or duplicate hash found." });
            } else {
                result.send({ success: true });
            }
        }
    }); 
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
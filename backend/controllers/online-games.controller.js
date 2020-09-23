const express = require('express');
const router = express.Router();
const mysql_connection = require('../database/mysql');

router.get('/get', getAll);
router.post('/post', create);

function getAll(request, result) {
    mysql_connection.query("SELECT * FROM OnlineGameMySQL", function(err, res) {
        if (err) {
            console.log("Error: ", err);
            result.send(err);
        } else {
            console.log(res);
            result.send(res);
        }
    });
}

function create(request, result) {
    var onlineGame = request.body;
    console.log(onlineGame);
    mysql_connection.query("INSERT INTO OnlineGameMySQL set ?", onlineGame, function (err, res) {
        if (err) {
            console.log("Error: ", err);
            result.send(err);
        } else {
            console.log(res);
            result.send(res);
        }
    });
}

module.exports = router;
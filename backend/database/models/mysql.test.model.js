var mysql_connection = require('../mysql');

var test = function(test) {
    this.userid = test.userid;
    this.username = test.username;
    this.password = test.password;
    this.email = test.email;
}

test.create = function (newtest, result) {
    // mysql.query('INSERT INTO User (UserID, Username, Password, EmailAddress) VALUES (1, "test2", "test2", "test2");', function (err, res) {
    //     if (err) {
    //         console.log("Error: ", err);
    //         result(err, null);
    //     }
    //     else {
    //         console.log(res)
    //     }
    // });
    mysql_connection.query("INSERT INTO User set ?", newtest, function (err, res) {
        if (err) {
            console.log("Error: ", err);
            result(err, null);
        }
        else {
            console.log(res.insertId);
            result(null, res.insertId);
        }
    });
}

module.exports = test;

"use strict";

var mysql_connection = require('../mysql');

var test = function test(_test) {
  this.userid = _test.userid;
  this.username = _test.username;
  this.password = _test.password;
  this.email = _test.email;
};

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
    } else {
      console.log(res.insertId);
      result(null, res.insertId);
    }
  });
};

module.exports = test;
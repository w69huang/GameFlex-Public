"use strict";

var mysql = require('./../mysql');

var test = function test(_test) {
  this.userid = _test.userid;
  this.username = _test.username;
  this.password = _test.password;
  this.email = _test.email;
};

test.create = function (newtest, result) {
  mysql.query('INSERT INTO User (UserID, Username, Password, EmailAddress) VALUES (1, "test2", "test2", "test2");', function (err, res) {
    if (err) throw err;
    console.log("Inserted");
    console.log(res);
  });
};
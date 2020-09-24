"use strict";

var mysql_connection = require('../mysql');

var test = function test(_test) {
  this.userID = _test.userID;
  this.username = _test.username;
  this.password = _test.password;
  this.email = _test.email;
};

test.create = function (newtest, result) {
  // mysql.query('INSERT INTO UserMySQL (UserID, Username, Password, EmailAddress) VALUES (1, "test2", "test2", "test2");', function (err, res) {
  //     if (err) {
  //         console.log("Error: ", err);
  //         result(err, null);
  //     }
  //     else {
  //         console.log(res)
  //     }
  // });
  mysql_connection.query("INSERT INTO UserMySQL set ?", newtest, function (err, res) {
    if (err) {
      console.log("Error: ", err);
      result(err, null);
    } else {
      console.log(res.insertId);
      result(null, res.insertId);
    }
  });
};

test.getUser = function (username, result) {
  mysql_connection.query("SELECT * FROM UserMySQL WHERE username=?", username, function (err, res) {
    if (err) {
      console.log("Error: ", err);
      result(err, null);
    } else {
      console.log(res);
      result(null, res);
    }
  });
};

test.getAllUsers = function (result) {
  mysql_connection.query("SELECT * FROM UserMySQL", function (err, res) {
    if (err) {
      console.log("Error: ", err);
      result(err, null);
    } else {
      console.log(res);
      result(null, res);
    }
  });
};

test.update = function (test, result) {
  mysql_connection.query("UPDATE UserMySQL SET username=?, password=?, email=? WHERE userID=?", [test.username, test.password, test.email, test.userID], function (err, res) {
    if (err) {
      console.log("Error: ", err);
      result(null, err);
    } else {
      result(null, res);
    }
  });
};

test["delete"] = function (userID, result) {
  mysql_connection.query("DELETE FROM UserMySQL WHERE userID =?", userID, function (err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      result(null, res);
    }
  });
};

module.exports = test;
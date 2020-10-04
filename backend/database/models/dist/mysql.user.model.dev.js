"use strict";

var mysql_connection = require('../mysql');

var nodemailer = require('nodemailer');

var user = function user(_user) {
  this.userID = _user.userID;
  this.username = _user.username;
  this.password = _user.password;
  this.email = _user.email;
};

function makeid(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;

  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

user.create = function (newUser, result) {
  mysql_connection.query("INSERT INTO UserMySQL set ?", newUser, function (err, res) {
    if (err) {
      console.log("Error: ", err);
      result(err, null);
    } else {
      console.log(res.insertId);
      result(null, res.insertId);
    }
  });
};

user.getUser = function (username, result) {
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

user.getAllUsers = function (result) {
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

user.update = function (user, result) {
  mysql_connection.query("UPDATE UserMySQL SET username=?, password=?, email=? WHERE userID=?", [user.username, user.password, user.email, user.userID], function (err, res) {
    if (err) {
      console.log("Error: ", err);
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

user["delete"] = function (userID, result) {
  mysql_connection.query("DELETE FROM UserMySQL WHERE userID =?", userID, function (err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

user.checkUsername = function (username, result) {
  mysql_connection.query("SELECT * FROM UserMySQL WHERE username=?", username, function (err, res) {
    if (err) {
      console.log("Error", err);
      result(err, null);
    } else {
      console.log(res);
      result(null, res);
    }
  });
};

user.checkEmail = function (email, result) {
  mysql_connection.query("SELECT * FROM UserMySQL WHERE email=?", email, function (err, res) {
    if (err) {
      console.log("Error", err);
      result(err, null);
    } else {
      console.log(res);
      result(null, res);
    }
  });
};

user.sendEmail = function (email, result) {
  // To do: Be able to send an email with a link possibly and create a new page for the change password functionality.
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'gameflextesting@gmail.com',
      pass: 'gameflex123'
    }
  });
  var newPassword = makeid(5);
  var mailOptions = {
    from: 'gameflextesting@gmail.com',
    to: email.toString(),
    subject: 'Reset Password',
    text: 'Your new password is: ' + newPassword
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      result(error, null);
    } else {
      mysql_connection.query("UPDATE UserMySQL SET password=? WHERE email=?", [newPassword, email], function (err, res) {
        if (err) {
          console.log("Error", err);
          result(err, null);
        } else {
          console.log("Password changed");
        }
      });
      console.log("Email Sent!");
      result(null, info.response);
    }
  });
};

module.exports = user;
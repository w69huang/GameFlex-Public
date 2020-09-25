var mysql_connection = require('../mysql');

var user = function(user) {
    this.userID = user.userID;
    this.username = user.username;
    this.password = user.password;
    this.email = user.email;
}

user.create = function (newUser, result) {
    // mysql.query('INSERT INTO UserMySQL (UserID, Username, Password, EmailAddress) VALUES (1, "test2", "test2", "test2");', function (err, res) {
    //     if (err) {
    //         console.log("Error: ", err);
    //         result(err, null);
    //     }
    //     else {
    //         console.log(res)
    //     }
    // });
    mysql_connection.query("INSERT INTO UserMySQL set ?", newUser, function (err, res) {
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

user.getUser = function(username, result) {
    mysql_connection.query("SELECT * FROM UserMySQL WHERE username=?", username, function(err, res) {
      if (err) {
        console.log("Error: ", err);
        result(err, null);
      } else {
        console.log(res);
        result(null, res);
      }
    })
  }
  
  user.getAllUsers = function(result) {
    mysql_connection.query("SELECT * FROM UserMySQL", function(err, res) {
      if (err) {
        console.log("Error: ", err);
        result(err, null);
      } else {
        console.log(res);
        result(null, res);
      }
    });
  };
  
  user.update = function(user, result) {
    mysql_connection.query(
      "UPDATE UserMySQL SET username=?, password=?, email=? WHERE userID=?",
      [user.username, user.password, user.email, user.userID],
      function(err, res) {
        if (err) {
          console.log("Error: ", err);
          result(null, err);
        } else {
          result(null, res);
        }
      }
    );
  };
  
  user.delete = function(userID, result) {
    mysql_connection.query(
      "DELETE FROM UserMySQL WHERE userID =?", userID, function(err, res) {
        if (err) {
          console.log("error: ", err);
          result(null, err);
        }
        else {
          result(null, res);
        }
      }
    )
  }

module.exports = user;

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

test.getUser = function(username, result) {
    mysql_connection.query("SELECT * FROM User WHERE username=?", username, function(err, res) {
      if (err) {
        console.log("Error: ", err);
        result(err, null);
      } else {
        console.log(res);
        result(null, res);
      }
    })
  }
  
  test.getAllUsers = function(result) {
    mysql_connection.query("SELECT * FROM User", function(err, res) {
      if (err) {
        console.log("Error: ", err);
        result(err, null);
      } else {
        console.log(res);
        result(null, res);
      }
    });
  };
  
  test.update = function(test, result) {
    mysql_connection.query(
      "UPDATE User SET username=?, password=?, email=? WHERE username=?",
      [test.username, test.password, test.email, test.username],
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
  
  test.delete = function(username, result) {
    mysql_connection.query(
      "DELETE FROM User WHERE username =?", username, function(err, res) {
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

module.exports = test;

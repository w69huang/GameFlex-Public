var mysql_connection = require('../database/mysql');

var nodemailer = require('nodemailer');
const express = require('express');

const router = express.Router();


router.post('/create', create);

router.post('/get', findByID);

router.get('/getall', findAll);

router.put('/update', update);

router.delete('/delete', deleteUser);

router.post('/checkusername', checkUsername);

router.post('/checkemail', checkEmail);

router.post('/checklogin', checkLogin);

router.put('/sendemail', sendEmail);

router.post('/changepassword', changePassword);

var user = function(user) {
    this.userID = user.userID;
    this.username = user.username;
    this.password = user.password;
    this.email = user.email;
}

function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


function create (req, res) {
    const new_user = new user(req.body);
    
    if(req.body.constructor === Object && Object.keys(req.body).length ===0) {
        res.sendStatus(400)
            .send({error:true, message:'Please Provide all required fields'});
    } else {
        mysql_connection.query("INSERT INTO UserMySQL set ?", new_user, function (err, result) {
            if (err) {
                console.log("Error: ", err);
                res.send(err);
            }
            else {
                console.log(result);
                res.send(result)
            }
        });
    }
};

function findAll (req, res) {
    mysql_connection.query("SELECT * FROM UserMySQL", function(err, result) {
        if (err) {
          console.log("Error: ", err);
            res.send(err)
        } else {
          console.log(res);
        res.send(result)
        }
      });
};

function findByID (req, res) {
    console.log("Find user by Username")
    console.log(req.body);
    mysql_connection.query("SELECT * FROM UserMySQL WHERE username=?", req.body.username, function(err, result) {
        if (err) {
          console.log("Error: ", err);
        res.send(err)
        } else {
          console.log(res);
        res.send(result);
        }
      });
};

function update (req, res) {
    const new_user = new user(req.body);
    if(req.body.constructor === Object && Object.keys(req.body).length === 0 ){
        res.status(400).send({error:true, message: 'Missing Fields'});

    } else {
        mysql_connection.query(
            "UPDATE UserMySQL SET username=?, password=?, email=? WHERE userID=?",
            [new_user.username, new_user.password, new_user.email, new_user.userID],
            function(err, result) {
              if (err) {
                console.log("Error: ", err);
                res.send(err)
              } else {
                res.json({error:false, message: "Successfully Updated"})
              }
            }
          );
    }
};

function deleteUser (req, res) {
    mysql_connection.query(
        "DELETE FROM UserMySQL WHERE userID =?", req.body.userID, function(err, result) {
          if (err) {
            console.log("error: ", err);
            res.send(err)
          }
          else {
            res.json({error: false, message: req.body})
          }
        }
      );
};

function checkUsername (req, res) {
    mysql_connection.query(
        "SELECT * FROM UserMySQL WHERE username=?", req.body.username, function(err, result) {
          if (err) {
            console.log("Error", err);
            res.send(err);
          } else {
            console.log(res);
            res.json(result);
          }
        }
      )
}

function checkEmail(req, res) {
    mysql_connection.query(
        "SELECT * FROM UserMySQL WHERE email=?", req.body.email, function(err, result) {
          if (err) {
            console.log("Error", err);
            res.send(err);
          } else {
            if (result[0] != undefined) {
                    res.send(result);
            } else {
                res.send(result)
            }
            console.log("Check Email");
            console.log(req.body);
        }
        }
      )
}

function checkLogin(req, res) {
    mysql_connection.query("SELECT * FROM UserMySQL WHERE username=?", req.body.username, function(err, result) {

        if(err) {
            res.send(err);
            console.log("Check Login");
            console.log(req.body);
        } else {
            if (result[0] != undefined) {
                if(req.body.password == result[0].password){
                    console.log("Check login: TRUE");
                    res.send(true);
                } else {
                    console.log("Check Login: False");
                    res.send(false);
                }
            } else {
                console.log("Check Login: No user");
                res.send(false);
            }
        }
      })
}

function sendEmail(req, res) {
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
      }
  
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
          res.send(error, null);
        } else {
          mysql_connection.query(
            "UPDATE UserMySQL SET password=? WHERE email=?",
            [newPassword, req.body.email], function(err, result) {
                if (err) {
                    res.send(err);
                    console.log("Send Email")
                    console.log(req.body);
                } else {
                    console.log("Email Sent!");
                    res.send(info.response);
                }
            });
        }
      })
}

function changePassword(req, res) {
    mysql_connection.query(
        "UPDATE UserMySQL SET password=? WHERE username=?",
        [req.body.newPassword, req.body.username],
        function(err, result) {
          if (err) {
            res.send(err);
            console.log("Change Password");
            console.log(req.body);
          } else {
            console.log("Change Password");
            res.send(true);
          }
        }
      );
}

module.exports = router
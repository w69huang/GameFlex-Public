const user = require('../database/models/mysql.user.model');

function create (req, res) {
    const new_user = new user(req.body);
    
    if(req.body.constructor === Object && Object.keys(req.body).length ===0) {
        res.status(400)
            .send({error:true, message:'Please Provide all required fields'});
    } else {
        user.create(new_user, function(err, user){
            if (err) {
                res.send(err);
            } else {
                res.json({error: false, message: "user Created Successfully!", data:user});
            }
        });
    }
};

function findAll (req, res) {
    user.getAllUsers( function(err, user) {
        console.log("Get all Users");
        if (err) {
            res.send(err);
        } else {
            res.send(user);
        }
    });
};

function findByID (req, res) {
    console.log("Find user by Username")
    console.log(req.body);
    user.getUser(req.body.username, function(err, user) {
        if (err) {
            res.send(err);
        } else {
            res.json(user);
        }
    });
};

function update (req, res) {
    const new_user = new user(req.body);
    if(req.body.constructor === Object && Object.keys(req.body).length === 0 ){
        res.status(400).send({error:true, message: 'Missing Fields'});

    } else {
        user.update(new_user, function(err, user) {
            if (err) {
                console.log("Update");
                console.log(err)
                res.send(err);

            } else {
                console.log("Update");
                console.log(user);
                res.json({error:false, message: "Successfully Updated"});
            };
        })
    }
};

function deleteUser (req, res) {
    user.delete(req.body.userID, function(err, user) {
        if (err) {
            res.send(err);
            console.log('Delete User')
            console.log(req.body);
        } else{
            res.json({error: false, message: req.body})
            console.log("Delete User")
            console.log(req.body);
        }
    });
};

function checkUsername (req, res) {
    user.checkUsername(req.body.username, function(err, user) {
        if (err) {
            res.send(err);
            console.log("Check Username");
            console.log(req.body);
        } else {
            res.json(user);
            console.log("Check Username");
            console.log(req.body);
        }
    })
}

function checkEmail(req, res) {
    user.checkEmail(req.body.email, function(err, user){
        if(err) {
            res.send(err);
            console.log("Check Email")
            console.log(req.body);
        } else {
            if (user[0] != undefined) {
                res.send(user);
            } else {
                res.send(user)
            }
            console.log("Check Email");
            console.log(req.body);
        }
    })
}

function checkLogin(req, res) {
    user.getUser(req.body.username, function(err, user) {
        if(err) {
            res.send(err);
            console.log("Check Login");
            console.log(req.body);
        } else {
            if (user[0] != undefined) {
                if(req.body.password == user[0].password){
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
    user.sendEmail(req.body.email, function(err, user) {
        if (err) {
            res.send(err);
            console.log("Send Email")
            console.log(req.body);
        } else {
            console.log("Send Email")
            res.send(true);
        }
    })
}

// Router Code:

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

module.exports = router
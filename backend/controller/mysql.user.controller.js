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
        console.log("Get all Controller");
        if (err) {
            res.send(err);
        } else {
            res.send(user);
        }
    });
};

function findByID (req, res) {
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
                res.send(err);
            } else {
                res.json({error:false, message: "Successfully Updated"});
            };
        })
    }
};

function deleteUser (req, res) {
    // console.log(req)
    user.delete(req.body.userID, function(err, user) {
        if (err) {
            res.send(err);
            console.log(req.body);
        } else{

            // res.json({error:false, message: 'Deleted'});
            res.json({error: false, message: req.body})
            console.log(req.body);
        }
    });
};

function checkUsername (req, res) {
    user.checkUsername(req.body.username, function(err, user) {
        if (err) {
            res.send(err);
            console.log(req.body);
        } else {
            res.json(user);
            console.log("Controller");
            console.log(req.body);
        }
    })
}

function checkEmail(req, res) {
    user.checkEmail(req.body.email, function(err, user){
        if(err) {
            res.send(err);
            console.log(req.body);
        } else {
            res.json(user);
            console.log("Controller");
            console.log(req.body);
        }
    })
}





// Router Code:

const express = require('express');

const router = express.Router();


router.post('/usercreate', create);

router.post('/userget', findByID);

router.get('/usergetall', findAll);

router.put('/userupdate', update);

router.delete('/userdelete', deleteUser);

router.post('/checkusername', checkUsername);

router.post('/checkemail', checkEmail);

module.exports = router
const test = require('../database/models/mysql.test.model');

function create (req, res) {
    const new_test = new test(req.body);
    
    if(req.body.constructor === Object && Object.keys(req.body).length ===0) {
        res.status(400)
            .send({error:true, message:'Please Provide all required fields'});
    } else {
        test.create(new_test, function(err, test){
            if (err) {
                res.send(err);
            } else {
                res.json({error: false, message: "Test Created Successfully!", data:test});
            }
        });
    }
};

function findAll (req, res) {
    test.getAllUsers( function(err, test) {
        console.log("Get all Controller");
        if (err) {
            res.send(err);
        } else {
            res.send(test);
        }
    });
};

function findByID (req, res) {
    test.getUser(req.body, function(err, test) {
        if (err) {
            res.send(err);
        } else {
            res.json(test);
        }
    });
};

function update (req, res) {
    const new_test = new test(req.body);
    if(req.body.constructor === Object && Object.keys(req.body).length === 0 ){
        res.status(400).send({error:true, message: 'Missing Fields'});

    } else {
        test.update(new_test, function(err, test) {
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
    test.delete(req.body.userID, function(err, test) {
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






// Router Code:

const express = require('express');

const router = express.Router();


router.post('/testcreate', create);

router.get('/testget', findByID);

router.get('/testgetall', findAll);

router.put('/testupdate', update);

router.delete('/testdelete', deleteUser);

module.exports = router
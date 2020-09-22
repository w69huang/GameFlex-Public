const test = require('../database/models/mysql.test.model');
const e = require('express');

exports.create = function (req, res) {
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

exports.findAll = function(req, res) {
    test.getAllUsers( function(err, test) {
        console.log("Get all Controller");
        if (err) {
            res.send(err);
        } else {
            res.send(test);
        }
    });
};

exports.findByID = function(req, res) {
    test.getUser(req.body.username, function(err, test) {
        if (err) {
            res.send(err);
        } else {
            res.json(test);
        }
    });
};

exports.update = function(req, res) {
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

exports.delete = function(req, res) {
    test.delete(req.body.username, function(err, test) {
        if (err) {
            res.send(err);
        } else{
            res.json({error:false, message: 'Deleted'});
        }
    });
};

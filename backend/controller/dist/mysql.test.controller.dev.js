"use strict";

var test = require('../database/models/mysql.test.model');

exports.create = function (req, res) {
  var new_test = new test(req.body);

  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res.status(400).send({
      error: true,
      message: 'Please Provide all required fields'
    });
  } else {
    test.create(new_test, function (err, test) {
      if (err) {
        res.send(err);
      } else {
        res.json({
          error: false,
          message: "Test Created Successfully!",
          data: test
        });
      }
    });
  }
};
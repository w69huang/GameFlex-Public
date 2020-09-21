"use strict";

var express = require('express');

var router = express.Router();

var testController = require('../controller/mysql.test.controller');

router.post('/testcreate', testController.create);

router.get('/get', testController.get);

router.get('/getall', testController.getAll);

router.put('/update', testController.update);

router.delete('/delete', testController.delete);

module.exports = router;
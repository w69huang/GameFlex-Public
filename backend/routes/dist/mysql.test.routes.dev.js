"use strict";

var express = require('express');

var router = express.Router();

var testController = require('../controller/mysql.test.controller');

router.post('/testcreate', testController.create);
module.exports = router;
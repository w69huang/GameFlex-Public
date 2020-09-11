const express = require('express');

const router = express.Router();

const testController = require('../controller/mysql.test.controller');

router.post('/testcreate',testController.create);


module.exports = router
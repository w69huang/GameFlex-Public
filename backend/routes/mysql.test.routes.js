const express = require('express');

const router = express.Router();

const testController = require('../controller/mysql.test.controller');

router.post('/testcreate',testController.create);

router.get('/testget', testController.findByID);

router.get('/testgetall', testController.findAll);

router.put('/testupdate', testController.update);

router.delete('/testdelete', testController.delete);

module.exports = router
const express = require('express');
const router = express.Router();

const Configuration = require('../database/models/configuration');

router.get('/getAll', getAll);
router.get('/:configurationId', getById);
router.post('/', create);
router.delete('/:configurationId', deleteById);
router.patch('/:configurationId', update);

function getById(req, res) {
    // note: `_id` is the auto-generated id for the task
    Configuration.findOne({ _id: req.params.configurationId })
        .then((configuration) => {
            if(configuration === null) {
                res.status(404).send('Error: No configuration found.');
            }
            res.send(configuration);
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send('Error: Query operation failed.');
        });
}

function getAll(req, res) {
    Configuration.find({ username: req.query.username })
        .then((configurations) => {
            if (configurations === null) {
                res.status(404).send('No configurations found for user.');
            }
            console.log('configs:');
            console.log(configurations);
            res.send(configurations);
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send('Error: Query operation failed.');
        });
}

function create(req, res) {
    newConfig = new Configuration(req.body.configuration);
    (newConfig)
        .save()
        .then((configuration) => {
            res.send(configuration);
        })
        .catch((error) => console.log(error))
}

function update(req, res) {
    newConfig = new Configuration(req.body.configuration);
    Configuration.findOneAndUpdate({ _id: req.params.configurationId }, { $set: newConfig })
        .then((configuration) => res.send(configuration))
        .catch((error) => console.log(error))
}

function deleteById(req, res) {
    Configuration.findByIdAndDelete({ _id: req.params.configurationId })
        .then((configuration) => res.send(configuration))
        .catch((error) => console.log(error))
}

module.exports = router;
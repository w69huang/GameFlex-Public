const express = require('express');
const router = express.Router();

const Configuration = require('../database/models/configuration');

router.get('/:configurationId', getById);
router.post('/', create);
router.delete('/:configurationId', deleteById);
router.patch('/:configurationId', update);

function getById(req, res) {
    // note: `_id` is the auto-generated id for the task
    Configuration.findOne({ _id: req.params.configurationId })
        .then((configuration) => {
            if(configuration === null) {
                res.status(404).send('Not Found: Valid query but not value found.');
            }
            res.send(configuration);
        })
        .catch((error) => {
            console.log(error);
            res.status(404).send('Not Found: Invalid query.');
        })
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
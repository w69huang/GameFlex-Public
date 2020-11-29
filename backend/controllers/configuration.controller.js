const express = require('express');
const router = express.Router();

const Configuration = require('../database/models/configuration');

router.get('/:configurationId', getById);
router.get('/configuration/:configurationId', getById);

router.post('/', create); //TODO Which of these actually runs?
router.post('/configuration', create);
router.delete('/:configurationId', deleteById);
router.patch('/:configurationId', update);

function getById(req, res) {
    // note: `_id` is the auto-generated id for the task
    Configuration.findOne({ _id: req.params.configurationId })
        .then((configuration) => {
            res.send(configuration)
        })
        .catch((error) => console.log(error))
    console.log('Config Get Backend has run!', req.params.configurationId);
}

function create(req, res) {
    console.log('\nThe req.body line: ', req.body);
    newConfig = new Configuration(req.body.configuration); //{ 'date': req.body.configuration.date, 'name': req.body.configuration.name, 'username': req.body.configuration.username, 'userId': req.body.configuration.userId, 'numPlayers': req.body.configuration.numPlayers, handsVisibleOnInsert: req.body.configuration.handsVisibleOnInsert, 'decks': req.body.configuration.decks, 'counters': [] });
    console.log('\nThe new config line: ', newConfig);
    (newConfig)
        .save()
        .then((configuration) => {
            res.send(configuration);
            console.log('\nThe then line: ', configuration);
        })
        .catch((error) => console.log(error))
    console.log('Config Post Backend has run!');
}

function update(req, res) {
    Configuration.findOneAndUpdate({ _id: req.params.configurationId }, { $set: req.body.configuration })
        .then((configuration) => res.send(configuration))
        .catch((error) => console.log(error))
    console.log('Config Patch/Update Backend has run!');
}

function deleteById(req, res) {
    Configuration.findByIdAndDelete({ _id: req.params.configurationId })
        .then((configuration) => res.send(configuration))
        .catch((error) => console.log(error))
    console.log('Config Delete Backend has run!');
}

module.exports = router;
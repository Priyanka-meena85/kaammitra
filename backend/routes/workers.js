const express = require('express');
const { getWorkers, getWorker } = require('../controllers/workerController');

const router = express.Router();

router.route('/').get(getWorkers);
router.route('/:id').get(getWorker);

module.exports = router;

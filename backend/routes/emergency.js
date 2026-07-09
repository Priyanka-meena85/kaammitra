const express = require('express');
const router = express.Router();

router.post('/', (req, res) => res.json({ message: 'Create emergency request' }));
router.get('/', (req, res) => res.json({ message: 'Get emergency requests' }));

module.exports = router;

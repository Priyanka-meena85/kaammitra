const express = require('express');
const router = express.Router();

router.post('/', (req, res) => res.json({ message: 'Create chat message' }));
router.get('/:conversationId', (req, res) => res.json({ message: 'Get chat history' }));

module.exports = router;

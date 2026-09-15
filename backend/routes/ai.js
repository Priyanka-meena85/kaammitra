const express = require('express');
const { aiProvider } = require('../services/aiService');

const router = express.Router();

// @desc    Understand natural language request
// @route   POST /api/v1/ai/understand-request
// @access  Public
router.post('/understand-request', async (req, res) => {
    try {
        const { text, language } = req.body;
        
        if (!text) {
            return res.status(400).json({ success: false, error: 'Text input is required' });
        }

        const intent = await aiProvider.understandIntent(text);
        
        res.status(200).json({
            success: true,
            data: intent
        });
    } catch (err) {
        console.error('AI Error:', err);
        res.status(500).json({ success: false, error: 'Failed to process AI request' });
    }
});

module.exports = router;

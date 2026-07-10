const express = require('express');
const {
    getChats,
    getChat,
    sendMessage
} = require('../controllers/chatController');

const { protect } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getChats);

router.route('/:conversationId')
    .get(getChat);

router.route('/:conversationId/messages')
    .post(sendMessage);

module.exports = router;

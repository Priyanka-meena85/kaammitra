const express = require('express');
const { register, login, getMe, firebaseLogin } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login); // Keep it if email/pass exists, or old login
router.post('/firebase-login', firebaseLogin);
router.get('/me', protect, getMe);

module.exports = router;

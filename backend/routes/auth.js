const express = require('express');
const { register, login, getMe, firebaseLogin, firebaseStatus } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

const { firebaseAuth, firebaseInitializationError } = require('../config/firebaseAdmin');

router.post('/register', register);
router.post('/login', login); // Keep it if email/pass exists, or old login
router.post('/firebase-login', firebaseLogin);
router.get('/me', protect, getMe);

router.get('/firebase-status', firebaseStatus);

module.exports = router;

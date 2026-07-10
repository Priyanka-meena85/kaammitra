const express = require('express');
const { register, login, getMe, firebaseLogin } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

const { firebaseAuth } = require('../config/firebaseAdmin');

router.post('/register', register);
router.post('/login', login); // Keep it if email/pass exists, or old login
router.post('/firebase-login', firebaseLogin);
router.get('/me', protect, getMe);

router.get('/firebase-status', (req, res) => {
    if (firebaseAuth) {
        res.status(200).json({ success: true, firebaseConfigured: true });
    } else {
        res.status(200).json({ success: false, firebaseConfigured: false, message: "Firebase Admin is not configured" });
    }
});

module.exports = router;

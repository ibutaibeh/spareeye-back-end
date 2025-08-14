const express = require('express');
const router = express.Router();
const { getProfile, changePassword } = require('../controllers/profileController');
const verifyToken = require('../middlewares/verify-token');

router.get('/', verifyToken, getProfile);
router.put('/change-password', verifyToken, changePassword);

module.exports = router;

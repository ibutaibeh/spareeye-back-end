const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verify-token');
const { getProfile, changePassword } = require('../controllers/profileController');

router.get('/', verifyToken, getProfile);
router.put('/change-password', verifyToken, changePassword);

module.exports = router;

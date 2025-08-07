const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');
const carRequestController = require('../controllers/carRequestController');

router.post('/', isAuthenticated, carRequestController.createCarRequest);
router.get('/', isAuthenticated, isAdmin, carRequestController.getAllCarRequests);
router.put('/:id/status', isAuthenticated, isAdmin, carRequestController.updateCarRequestStatus);

module.exports = router;

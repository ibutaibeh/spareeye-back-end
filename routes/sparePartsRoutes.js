const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { isAuthenticated } = require('../middleware/authMiddleware');
const sparePartController = require('../controllers/sparePartController');

router.post('/', isAuthenticated, upload.single('image'), sparePartController.createSparePart);
router.get('/', sparePartController.getAllSpareParts);
router.get('/:id', sparePartController.getSparePartById);
router.delete('/:id', isAuthenticated, sparePartController.deleteSparePart);

module.exports = router;

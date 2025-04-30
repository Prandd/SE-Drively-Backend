const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const promotionsController = require('../controllers/promotions');

// Get all promotions
router.get('/', promotionsController.getAllPromotions);

// Create promotion (admin only)
router.post('/', protect, promotionsController.createPromotion);

// Update promotion (admin only)
router.put('/:id', protect, promotionsController.updatePromotion);

// Delete promotion (admin only)
router.delete('/:id', protect, promotionsController.deletePromotion);

module.exports = router;

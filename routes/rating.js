const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/auth');
const {
    addRating,
    updateRating,
    deleteRating,
    getCarRatings,
    getMyRatings
} = require('../controllers/rating');

router.route('/')
    .get(getCarRatings)
    .post(protect, addRating);

router.route('/:ratingId')
    .put(protect, updateRating)
    .delete(protect, deleteRating);

// Add route for getting user's reviews
router.get('/my/reviews', protect, getMyRatings);

module.exports = router;
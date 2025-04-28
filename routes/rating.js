const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/auth');
const {
    addRating,
    updateRating,
    deleteRating,
    getCarRatings,
    getMyRatings,
    getMyCarRatings
} = require('../controllers/rating');

router.route('/')
    .get(getCarRatings)
    .post(protect, addRating);

// User specific rating routes
router.get('/my/reviews', protect, getMyRatings);
router.get('/my/cars', protect, getMyCarRatings);

router.route('/:ratingId')
    .put(protect, updateRating)
    .delete(protect, deleteRating);

module.exports = router;
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ratingRoutes = require('./rating');

const {
    getCars,
    getCar,
    createCar,
    updateCar,
    deleteCar,
    getUserCars,
    getMyTopRatedCars
} = require('../controllers/car');

// Re-route into rating routes
router.use('/:carId/ratings', ratingRoutes);

// Public routes
router.get('/', getCars);
router.get('/:id', getCar);

// Protected routes
router.get('/user/cars', protect, getUserCars);
router.get('/my/top-rated', protect, authorize('car-owner', 'admin'), getMyTopRatedCars);

// Protected routes for car management (car-owner only)
router.post('/', protect, authorize('car-owner', 'admin'), createCar);
router.route('/:id')
    .put(protect, authorize('car-owner', 'admin'), updateCar)
    .delete(protect, authorize('car-owner', 'admin'), deleteCar);

module.exports = router;
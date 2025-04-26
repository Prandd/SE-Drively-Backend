const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

const {
    getReservations,
    getMyReservations,
    getReceivedReservations,
    createReservation,
    updateReservationStatus,
    checkCarAvailability,
    deleteReservation
} = require('../controllers/reservation');

// Admin routes
router.get('/all', protect, authorize('admin'), getReservations);

// Car-renter routes
router.post('/', protect, authorize('car-renter'), createReservation);
router.get('/my', protect, authorize('car-renter'), getMyReservations);
router.delete('/:id', protect, authorize('car-renter', 'car-owner'), deleteReservation);

// Car-owner routes
router.get('/received', protect, authorize('car-owner'), getReceivedReservations);
router.put('/:id/status', protect, authorize('car-owner', 'admin'), updateReservationStatus);

// Public routes (with authentication)
router.get('/availability', protect, checkCarAvailability);

module.exports = router;

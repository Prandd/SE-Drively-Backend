const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Reservation:
 *       type: object
 *       required:
 *         - carId
 *         - pickUpDate
 *         - returnDate
 *       properties:
 *         carId:
 *           type: string
 *           example: "60d725c6b0c7c1b8d0f0e5a1"
 *         pickUpDate:
 *           type: string
 *           format: date-time
 *           example: "2024-03-20T10:00:00Z"
 *         returnDate:
 *           type: string
 *           format: date-time
 *           example: "2024-03-25T10:00:00Z"
 *         totalPrice:
 *           type: number
 *           example: 12500
 *         status:
 *           type: string
 *           enum: [pending, accepted, completed, cancelled]
 *           example: pending
 * 
 * /api/v1/reservations/all:
 *   get:
 *     tags: [Reservations]
 *     summary: Get all reservations (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all reservations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reservation'
 * 
 * /api/v1/reservations:
 *   post:
 *     tags: [Reservations]
 *     summary: Create a new reservation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Reservation'
 *     responses:
 *       201:
 *         description: Reservation created successfully
 * 
 * /api/v1/reservations/my:
 *   get:
 *     tags: [Reservations]
 *     summary: Get user's reservations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's reservations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reservation'
 * 
 * /api/v1/reservations/received:
 *   get:
 *     tags: [Reservations]
 *     summary: Get received reservations (Car owner only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of received reservations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reservation'
 * 
 * /api/v1/reservations/{id}/status:
 *   put:
 *     tags: [Reservations]
 *     summary: Update reservation status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [accepted, rejected, cancelled]
 *                 example: accepted
 *     responses:
 *       200:
 *         description: Reservation status updated successfully
 * 
 * /api/v1/reservations/availability:
 *   get:
 *     tags: [Reservations]
 *     summary: Check car availability
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: carId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Car availability status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 available:
 *                   type: boolean
 *                   example: true
 */

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

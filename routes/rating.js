const express = require('express');
/**
 * @swagger
 * components:
 *   schemas:
 *     Rating:
 *       type: object
 *       required:
 *         - score
 *         - comment
 *       properties:
 *         score:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           example: 4
 *         comment:
 *           type: string
 *           maxLength: 500
 *           example: "Great car, very clean and runs smoothly"
 *         createdAt:
 *           type: string
 *           format: date-time
 * 
 * /api/v1/cars/{carId}/ratings:
 *   get:
 *     tags: [Ratings]
 *     summary: Get all ratings for a car
 *     parameters:
 *       - in: path
 *         name: carId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of ratings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Rating'
 *   post:
 *     tags: [Ratings]
 *     summary: Create a new rating
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: carId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Rating'
 *     responses:
 *       201:
 *         description: Rating created successfully
 * 
 * /api/v1/cars/{carId}/ratings/{ratingId}:
 *   put:
 *     tags: [Ratings]
 *     summary: Update a rating
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: carId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: ratingId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Rating'
 *     responses:
 *       200:
 *         description: Rating updated successfully
 *   delete:
 *     tags: [Ratings]
 *     summary: Delete a rating
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: carId
 *         required: true
 *         schema:
 *           type: string
 *         description: Car ID
 *       - in: path
 *         name: ratingId
 *         required: true
 *         schema:
 *           type: string
 *         description: Rating ID
 *     responses:
 *       200:
 *         description: Rating deleted successfully
 *
 * /api/v1/cars/{carId}/ratings/my/reviews:
 *   get:
 *     tags: [Ratings]
 *     summary: Get user's ratings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's ratings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Rating'
 *
 * /api/v1/cars/{carId}/ratings/my/cars:
 *   get:
 *     tags: [Ratings]
 *     summary: Get all ratings for current user's cars
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of ratings for user's cars
 */
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
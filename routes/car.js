const express = require('express');
/**
 * @swagger
 * components:
 *   schemas:
 *     Car:
 *       type: object
 *       required:
 *         - make
 *         - model
 *         - year
 *         - numberPlates
 *         - description
 *         - rentalPrice
 *         - color
 *         - transmission
 *         - fuelType
 *       properties:
 *         make:
 *           type: string
 *           example: Toyota
 *         model:
 *           type: string
 *           example: Camry
 *         year:
 *           type: number
 *           example: 2022
 *         numberPlates:
 *           type: string
 *           example: กข 1234
 *         description:
 *           type: string
 *           example: Comfortable sedan with good fuel economy
 *         rentalPrice:
 *           type: number
 *           example: 2500
 *         color:
 *           type: string
 *           example: Silver
 *         transmission:
 *           type: string
 *           enum: [automatic, manual]
 *           example: automatic
 *         fuelType:
 *           type: string
 *           enum: [petrol, diesel, electric, hybrid]
 *           example: petrol
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           example: ["GPS", "Bluetooth", "Backup Camera"]
 *         available:
 *           type: boolean
 *           example: true
 * 
 * /api/v1/cars:
 *   get:
 *     tags: [Cars]
 *     summary: Get all cars
 *     description: Retrieve a list of all available cars with optional filtering
 *     parameters:
 *       - in: query
 *         name: select
 *         schema:
 *           type: string
 *         description: Fields to select (comma-separated)
 *         example: make,model,year
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort criteria (comma-separated)
 *         example: -year,make
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Results per page
 *         example: 10
 *     responses:
 *       200:
 *         description: List of cars
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Car'
 *   post:
 *     tags: [Cars]
 *     summary: Create a new car
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Car'
 *     responses:
 *       201:
 *         description: Car created successfully
 * 
 * /api/v1/cars/{id}:
 *   get:
 *     tags: [Cars]
 *     summary: Get single car
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Car ID
 *     responses:
 *       200:
 *         description: Car details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Car'
 *   put:
 *     tags: [Cars]
 *     summary: Update car
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
 *             $ref: '#/components/schemas/Car'
 *     responses:
 *       200:
 *         description: Car updated successfully
 *   delete:
 *     tags: [Cars]
 *     summary: Delete car
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Car deleted successfully
 * 
 * /api/v1/cars/user/cars:
 *   get:
 *     tags: [Cars]
 *     summary: Get user's cars
 *     description: Get all cars owned by the current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's cars
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Car'
 * 
 * /api/v1/cars/my/top-rated:
 *   get:
 *     tags: [Cars]
 *     summary: Get user's top rated cars
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of top rated cars
 */

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
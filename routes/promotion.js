const express = require('express');
/**
 * @swagger
 * components:
 *   schemas:
 *     Promotion:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - discountPercentage
 *         - startDate
 *         - endDate
 *       properties:
 *         title:
 *           type: string
 *           example: "Summer Sale"
 *         description:
 *           type: string
 *           example: "Get 20% off on all car rentals"
 *         discountPercentage:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           example: 20
 *         startDate:
 *           type: string
 *           format: date
 *           example: "2024-04-01"
 *         endDate:
 *           type: string
 *           format: date
 *           example: "2024-04-30"
 *         isActive:
 *           type: boolean
 *           default: true
 *           example: true
 * 
 * /api/v1/promotions:
 *   get:
 *     tags: [Promotions]
 *     summary: Get all promotions
 *     description: Retrieve all available promotions
 *     responses:
 *       200:
 *         description: List of promotions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Promotion'
 *   
 *   post:
 *     tags: [Promotions]
 *     summary: Create new promotion
 *     description: Create a new promotion (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Promotion'
 *     responses:
 *       201:
 *         description: Promotion created successfully
 *
 * /api/v1/promotions/{id}:
 *   put:
 *     tags: [Promotions]
 *     summary: Update promotion
 *     description: Update an existing promotion (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Promotion'
 *     responses:
 *       200:
 *         description: Promotion updated successfully
 *   
 *   delete:
 *     tags: [Promotions]
 *     summary: Delete promotion
 *     description: Delete an existing promotion (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Promotion deleted successfully
 */

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

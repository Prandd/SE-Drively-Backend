const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getMembershipStatus,
    upgradeMembership,
    getMembershipTiers,
    cancelMembership
} = require('../controllers/membership');

/**
 * @swagger
 * components:
 *   schemas:
 *     MembershipTier:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           enum: [basic, silver, gold]
 *           example: silver
 *         benefits:
 *           type: object
 *           properties:
 *             discountRate:
 *               type: number
 *               example: 0.10
 *             freeDelivery:
 *               type: boolean
 *               example: true
 *             prioritySupport:
 *               type: boolean
 *               example: true
 *             extraDriverOption:
 *               type: boolean
 *               example: false
 * 
 * /api/v1/membership/status:
 *   get:
 *     tags: [Membership]
 *     summary: Get user's membership status
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current membership status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MembershipTier'
 * 
 * /api/v1/membership/upgrade:
 *   post:
 *     tags: [Membership]
 *     summary: Upgrade user's membership
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tier]
 *             properties:
 *               tier:
 *                 type: string
 *                 enum: [silver, gold]
 *                 example: gold
 *     responses:
 *       200:
 *         description: Membership upgraded successfully
 * 
 * /api/v1/membership/tiers:
 *   get:
 *     tags: [Membership]
 *     summary: Get all available membership tiers
 *     responses:
 *       200:
 *         description: List of membership tiers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MembershipTier'
 * 
 * /api/v1/membership/cancel:
 *   post:
 *     tags: [Membership]
 *     summary: Cancel current membership
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Membership cancelled successfully
 */

router.get('/status', protect, getMembershipStatus);
router.post('/upgrade', protect, upgradeMembership);
router.get('/tiers', getMembershipTiers);
router.post('/cancel', protect, cancelMembership);

module.exports = router;
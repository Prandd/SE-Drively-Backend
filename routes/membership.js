const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getMembershipStatus,
    upgradeMembership,
    getMembershipTiers,
    cancelMembership
} = require('../controllers/membership');

router.get('/status', protect, getMembershipStatus);
router.post('/upgrade', protect, upgradeMembership);
router.get('/tiers', getMembershipTiers);
router.post('/cancel', protect, cancelMembership);

module.exports = router;
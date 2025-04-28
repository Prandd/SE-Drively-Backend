const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getMembershipStatus,
    upgradeMembership,
    getMembershipTiers,
    cancelMembership,
    renewMembership
} = require('../controllers/membership');

router.get('/status', protect, getMembershipStatus);
router.post('/upgrade', protect, upgradeMembership);
router.get('/tiers', getMembershipTiers);
router.post('/cancel', protect, cancelMembership);
router.post('/renew', protect, renewMembership);

module.exports = router;
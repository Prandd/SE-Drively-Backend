const User = require('../models/user');

// @desc    Get membership status and benefits
exports.getMembershipStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json({
            success: true,
            data: {
                tier: user.membershipTier,
                benefits: user.membershipBenefits,
                expiryDate: user.membershipExpiryDate,
                memberSince: user.memberSince
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// @desc    Upgrade membership tier (requires payment verification in production)
exports.upgradeMembership = async (req, res) => {
    try {
        const { tier } = req.body;

        if (!['basic', 'silver', 'gold'].includes(tier)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid membership tier'
            });
        }

        const user = await User.findById(req.user._id);
        user.membershipTier = tier;
        user.membershipExpiryDate = new Date(+new Date() + 365*24*60*60*1000);
        
        // Update benefits based on new tier
        user.updateMembershipBenefits();
        await user.save();

        res.status(200).json({
            success: true,
            data: {
                tier: user.membershipTier,
                benefits: user.membershipBenefits,
                expiryDate: user.membershipExpiryDate
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// @desc    Get all available membership tiers and their benefits
exports.getMembershipTiers = async (req, res) => {
    try {
        const tiers = {
            basic: {
                name: 'Basic',
                price: 0,
                benefits: {
                    discountRate: 0,
                    freeDelivery: false,
                    prioritySupport: false,
                    extraDriverOption: false
                }
            },
            silver: {
                name: 'Silver',
                price: 99.99,
                benefits: {
                    discountRate: 0.10,
                    freeDelivery: true,
                    prioritySupport: true,
                    extraDriverOption: false
                }
            },
            gold: {
                name: 'Gold',
                price: 199.99,
                benefits: {
                    discountRate: 0.15,
                    freeDelivery: true,
                    prioritySupport: true,
                    extraDriverOption: true
                }
            }
        };

        res.status(200).json({
            success: true,
            data: tiers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};
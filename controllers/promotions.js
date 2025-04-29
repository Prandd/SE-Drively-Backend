const Promotion = require('../models/promotion');

// Get all valid promotions (validTo >= now)
exports.getPromotions = async (req, res) => {
    try {
        const promotionsList = await Promotion.find({ validTo: { $gte: new Date() } });
        res.status(200).json({
            success: true,
            data: promotionsList
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// Get all promotions (no filter)
exports.getAllPromotions = async (req, res) => {
    try {
        const promos = await Promotion.find();
        res.json({ success: true, data: promos });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// Create promotion (admin only)
exports.createPromotion = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ success: false, error: 'Forbidden' });
        const promo = await Promotion.create(req.body);
        res.json({ success: true, data: promo });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// Update promotion (admin only)
exports.updatePromotion = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ success: false, error: 'Forbidden' });
        const promo = await Promotion.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: promo });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// Delete promotion (admin only)
exports.deletePromotion = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ success: false, error: 'Forbidden' });
        await Promotion.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

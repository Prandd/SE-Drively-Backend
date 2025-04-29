const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  discountPercent: { type: Number, default: 0 }, // e.g. 50 for 50% off
  validFrom: { type: Date, required: true },
  validTo: { type: Date, required: true },
  extraBenefit: String // e.g. "Free pillow"
});

module.exports = mongoose.model('Promotion', promotionSchema);

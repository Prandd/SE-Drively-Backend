const mongoose = require('mongoose');
const Promotion = require('../models/promotion');

const now = new Date();
const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

const promotions = [
  {
    title: 'Weekly Special: Free Pillow',
    description: 'Rent any car this week and get a free pillow included!',
    discountPercent: 0,
    validFrom: now,
    validTo: weekLater,
    extraBenefit: 'Free pillow'
  },
  {
    title: '50% Off Flash Sale',
    description: 'Get 50% off all car rentals for a limited time!',
    discountPercent: 50,
    validFrom: now,
    validTo: weekLater,
    extraBenefit: ''
  }
];

async function seed() {
  await mongoose.connect('mongodb://localhost:27017/YOUR_DB_NAME');
  await Promotion.deleteMany({});
  await Promotion.insertMany(promotions);
  console.log('Promotions seeded!');
  process.exit();
}

seed();

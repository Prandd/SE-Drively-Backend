const mongoose = require('mongoose');

const CarSchema = new mongoose.Schema({
    make: {
        type: String,
        required: [true, 'Please add car make']
    },
    model: {
        type: String,
        required: [true, 'Please add car model']
    },
    year: {
        type: Number,
        required: [true, 'Please add car year']
    },
    numberPlates: {
        type: String,
        required: [true, 'Please add number plates'],
        unique: true
    },
    description: {
        type: String,
        required: [true, 'Please add car description']
    },
    rentalPrice: {
        type: Number,
        required: [true, 'Please add rental price per day']
    },
    color: {
        type: String,
        required: [true, 'Please add car color']
    },
    transmission: {
        type: String,
        required: [true, 'Please add transmission type'],
        enum: ['automatic', 'manual']
    },
    fuelType: {
        type: String,
        required: [true, 'Please add fuel type'],
        enum: ['petrol', 'diesel', 'electric', 'hybrid']
    },
    features: [{
        type: String
    }],
    available: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ratings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rating'
    }],
    ratingScore: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Calculate average rating score when ratings are populated
CarSchema.pre('save', async function(next) {
    if (this.ratings && this.ratings.length > 0) {
        const Rating = mongoose.model('Rating');
        const ratings = await Rating.find({ _id: { $in: this.ratings } });
        const totalScore = ratings.reduce((sum, rating) => sum + rating.score, 0);
        this.ratingScore = totalScore / ratings.length;
        this.reviewCount = ratings.length;
    }
    next();
});

module.exports = mongoose.model('Car', CarSchema);

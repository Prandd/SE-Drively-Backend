const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    score: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        maxlength: 500
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

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
    ratings: [ratingSchema],
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

// Calculate average rating score when ratings are modified
CarSchema.pre('save', function(next) {
    if (this.ratings && this.ratings.length > 0) {
        const totalScore = this.ratings.reduce((sum, rating) => sum + rating.score, 0);
        this.ratingScore = totalScore / this.ratings.length;
        this.reviewCount = this.ratings.length;
    }
    next();
});

module.exports = mongoose.model('Car', CarSchema);

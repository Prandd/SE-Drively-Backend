const Car = require('../models/car');
const Rating = require('../models/rating');
const Reservation = require('../models/reservation');
const User = require('../models/user');

// @desc    Add rating to car
// @route   POST /api/v1/cars/:carId/ratings
exports.addRating = async (req, res) => {
    try {
        // Get an unrated reservation for this car and user
        const reservation = await Reservation.findOne({
            car: req.params.carId,
            user: req.user._id,
            status: 'accepted',
            rating: { $exists: false }
        });

        if (!reservation) {
            return res.status(403).json({
                success: false,
                error: 'No eligible reservations found for rating'
            });
        }

        // Create rating
        const rating = await Rating.create({
            user: req.user._id,
            car: req.params.carId,
            score: req.body.score,
            comment: req.body.comment
        });

        // Update references
        reservation.rating = rating._id;
        const car = await Car.findById(req.params.carId);
        const user = await User.findById(req.user._id);
        
        car.ratings.push(rating._id);
        user.ratings.push(rating._id);
        
        await Promise.all([car.save(), user.save(), reservation.save()]);

        res.status(201).json({
            success: true,
            data: rating
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Update rating
// @route   PUT /api/v1/cars/:carId/ratings/:ratingId
exports.updateRating = async (req, res) => {
    try {
        const rating = await Rating.findById(req.params.ratingId);
        
        if (!rating) {
            return res.status(404).json({
                success: false,
                error: 'Rating not found'
            });
        }

        if (rating.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this rating'
            });
        }

        rating.score = req.body.score || rating.score;
        rating.comment = req.body.comment || rating.comment;
        await rating.save();

        // Update car's average rating
        const car = await Car.findById(rating.car);
        await car.save();

        res.status(200).json({
            success: true,
            data: rating
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get all ratings for a car
// @route   GET /api/v1/cars/:carId/ratings
exports.getCarRatings = async (req, res) => {
    try {
        const ratings = await Rating.find({ car: req.params.carId })
            .populate('user', 'name');

        res.status(200).json({
            success: true,
            count: ratings.length,
            data: ratings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// @desc    Delete rating
// @route   DELETE /api/v1/cars/:carId/ratings/:ratingId
exports.deleteRating = async (req, res) => {
    try {
        const rating = await Rating.findById(req.params.ratingId);
        
        if (!rating) {
            return res.status(404).json({
                success: false,
                error: 'Rating not found'
            });
        }

        // Remove rating from reservation
        const reservation = await Reservation.findOne({ rating: rating._id });
        if (reservation) {
            reservation.rating = undefined;
            await reservation.save();
        }

        // Remove rating from car and user
        const car = await Car.findById(rating.car);
        const user = await User.findById(rating.user);
        
        car.ratings = car.ratings.filter(r => r.toString() !== rating._id.toString());
        user.ratings = user.ratings.filter(r => r.toString() !== rating._id.toString());
        
        await Promise.all([car.save(), user.save(), rating.deleteOne()]);

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// @desc    Get all ratings by current user
// @route   GET /api/v1/ratings/my/reviews
exports.getMyRatings = async (req, res) => {
    try {
        const ratings = await Rating.find({ user: req.user._id })
            .populate({
                path: 'car',
                select: 'make model year numberPlates'
            }).sort('-createdAt');

        res.status(200).json({
            success: true,
            count: ratings.length,
            data: ratings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// @desc    Get all ratings for cars owned by current user
// @route   GET /api/v1/ratings/my/cars
exports.getMyCarRatings = async (req, res) => {
    try {
        // First get all cars owned by user
        const cars = await Car.find({ createdBy: req.user._id });
        const carIds = cars.map(car => car._id);
        
        // Then get all ratings for these cars
        const ratings = await Rating.find({ car: { $in: carIds } })
            .populate({
                path: 'car',
                select: 'make model year numberPlates'
            })
            .populate({
                path: 'user',
                select: 'name'
            })
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: ratings.length,
            data: ratings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};
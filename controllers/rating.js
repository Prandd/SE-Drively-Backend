const Car = require('../models/car');
const Reservation = require('../models/reservation');

// @desc    Add rating to car
// @route   POST /api/v1/cars/:carId/ratings
exports.addRating = async (req, res) => {
    try {
        // Verify user has rented this car before
        const hasRented = await Reservation.findOne({
            user: req.user._id,
            car: req.params.carId,
            status: 'accepted'
        });

        if (!hasRented) {
            return res.status(403).json({
                success: false,
                error: 'You can only rate cars you have rented'
            });
        }

        // Check if user has already rated
        const car = await Car.findById(req.params.carId);
        const existingRating = car.ratings.find(
            rating => rating.user.toString() === req.user._id.toString()
        );

        if (existingRating) {
            return res.status(400).json({
                success: false,
                error: 'You have already rated this car'
            });
        }

        // Add new rating
        car.ratings.push({
            user: req.user._id,
            score: req.body.score,
            comment: req.body.comment
        });

        await car.save();

        res.status(201).json({
            success: true,
            data: car
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
        const car = await Car.findById(req.params.carId);
        
        const rating = car.ratings.id(req.params.ratingId);
        
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

        await car.save();

        res.status(200).json({
            success: true,
            data: car
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
        const car = await Car.findById(req.params.carId)
            .populate({
                path: 'ratings.user',
                select: 'name'
            });

        if (!car) {
            return res.status(404).json({
                success: false,
                error: 'Car not found'
            });
        }

        res.status(200).json({
            success: true,
            count: car.ratings.length,
            data: car.ratings
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
        const car = await Car.findById(req.params.carId);
        
        const rating = car.ratings.id(req.params.ratingId);
        
        if (!rating) {
            return res.status(404).json({
                success: false,
                error: 'Rating not found'
            });
        }

        if (rating.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to delete this rating'
            });
        }

        rating.remove();
        await car.save();

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
// @route   GET /api/v1/ratings/my
// @access  Private
exports.getMyRatings = async (req, res) => {
    try {
        const cars = await Car.find({
            'ratings.user': req.user._id
        });

        // Extract and format ratings
        const ratings = cars.reduce((acc, car) => {
            const userRatings = car.ratings.filter(
                rating => rating.user.toString() === req.user._id.toString()
            ).map(rating => ({
                ...rating.toObject(),
                car: {
                    _id: car._id,
                    make: car.make,
                    model: car.model,
                    year: car.year
                }
            }));
            return [...acc, ...userRatings];
        }, []);

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
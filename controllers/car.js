const Car = require('../models/car');
const User = require('../models/user');

// @desc    Get all cars with filtering, sorting, and pagination
exports.getCars = async (req, res) => {
    try {
        let query = {};

        // Filtering
        if (req.query.make) query.make = new RegExp(req.query.make, 'i');
        if (req.query.model) query.model = new RegExp(req.query.model, 'i');
        if (req.query.year) query.year = parseInt(req.query.year);
        if (req.query.transmission) query.transmission = req.query.transmission;
        if (req.query.fuelType) query.fuelType = req.query.fuelType;
        if (req.query.color) query.color = new RegExp(req.query.color, 'i');
        if (req.query.available === 'true') query.available = true;
        if (req.query.available === 'false') query.available = false;
        if (req.query.minPrice) query.rentalPrice = { $gte: parseFloat(req.query.minPrice) };
        if (req.query.maxPrice) {
            query.rentalPrice = { ...query.rentalPrice, $lte: parseFloat(req.query.maxPrice) };
        }
        if (req.query.minRating) {
            query.ratingScore = { $gte: parseFloat(req.query.minRating) };
        }

        // Execute query with sorting and populate ratings
        let result = Car.find(query)
            .populate('createdBy', 'name email telephoneNumber')
            .populate({
                path: 'ratings',
                populate: {
                    path: 'user',
                    select: 'name'
                }
            });

        // Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            result = result.sort(sortBy);
        } else {
            result = result.sort('-createdAt');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Car.countDocuments(query);

        result = result.skip(startIndex).limit(limit);

        // Apply membership discounts if user is authenticated
        const cars = await result;
        let processedCars = cars;

        if (req.user) {
            const user = await User.findById(req.user._id);
            if (user.membershipBenefits && user.membershipBenefits.discountRate > 0) {
                processedCars = cars.map(car => ({
                    ...car.toObject(),
                    discountedPrice: car.rentalPrice * (1 - user.membershipBenefits.discountRate)
                }));
            }
        }

        // Pagination result
        const pagination = {};
        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            };
        }
        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            };
        }

        res.status(200).json({
            success: true,
            count: cars.length,
            pagination,
            data: processedCars
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get single car
// @route   GET /api/v1/cars/:id
// @access  Public
exports.getCar = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id)
            .populate('createdBy', 'name email telephoneNumber')
            .populate({
                path: 'ratings',
                populate: {
                    path: 'user',
                    select: 'name'
                }
            });
        
        if (!car) {
            return res.status(404).json({
                success: false,
                error: 'Car not found'
            });
        }

        res.status(200).json({
            success: true,
            data: car
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// @desc    Create car listing
// @route   POST /api/v1/cars
// @access  Private
exports.createCar = async (req, res) => {
    try {
        req.body.createdBy = req.user._id;
        const car = await Car.create(req.body);
        
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

// @desc    Update car
// @route   PUT /api/v1/cars/:id
// @access  Private
exports.updateCar = async (req, res) => {
    try {
        let car = await Car.findById(req.params.id);

        if (!car) {
            return res.status(404).json({
                success: false,
                error: 'Car not found'
            });
        }

        // Make sure user is car owner
        if (car.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this car'
            });
        }

        car = await Car.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

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

// @desc    Delete car
// @route   DELETE /api/v1/cars/:id
// @access  Private
exports.deleteCar = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);

        if (!car) {
            return res.status(404).json({
                success: false,
                error: 'Car not found'
            });
        }

        // Make sure user is car owner
        if (car.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to delete this car'
            });
        }

        await car.deleteOne();

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

// @desc    Get user's cars
// @route   GET /api/v1/cars/user
// @access  Private
exports.getUserCars = async (req, res) => {
    try {
        const cars = await Car.find({ createdBy: req.user._id });

        res.status(200).json({
            success: true,
            count: cars.length,
            data: cars
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// @desc    Get user's top rated cars
// @route   GET /api/v1/cars/my/top-rated
// @access  Private
exports.getMyTopRatedCars = async (req, res) => {
    try {
        const cars = await Car.find({ createdBy: req.user._id })
            .sort('-ratingScore')
            .limit(3);

        res.status(200).json({
            success: true,
            data: cars
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

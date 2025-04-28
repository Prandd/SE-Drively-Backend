const Reservation = require('../models/reservation');
const Car = require('../models/car');

// @desc    Get all reservations (admin only)
exports.getReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find()
            .populate('user', 'name email')
            .populate('car');

        res.status(200).json({
            success: true,
            count: reservations.length,
            data: reservations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// @desc    Get user's reservations
exports.getMyReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find({ user: req.user._id })
            .populate('car');

        res.status(200).json({
            success: true,
            count: reservations.length,
            data: reservations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// @desc    Get car owner's received reservations
exports.getReceivedReservations = async (req, res) => {
    try {
        // First get all cars owned by the user
        const userCars = await Car.find({ createdBy: req.user._id });
        const carIds = userCars.map(car => car._id);

        // Then get all reservations for these cars
        const reservations = await Reservation.find({
            car: { $in: carIds }
        }).populate('user', 'name email telephoneNumber')
          .populate('car');

        res.status(200).json({
            success: true,
            count: reservations.length,
            data: reservations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// @desc    Create new reservation
exports.createReservation = async (req, res) => {
    try {
        req.body.user = req.user._id;

        const car = await Car.findById(req.body.car);
        if (!car) {
            return res.status(404).json({
                success: false,
                error: 'Car not found'
            });
        }

        if (car.createdBy.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                error: 'You cannot rent your own car'
            });
        }

        const pickUpDate = new Date(req.body.pickUpDate);
        const returnDate = new Date(req.body.returnDate);

        if (pickUpDate < new Date()) {
            return res.status(400).json({
                success: false,
                error: 'Pick-up date cannot be in the past'
            });
        }

        if (returnDate <= pickUpDate) {
            return res.status(400).json({
                success: false,
                error: 'Return date must be after pick-up date'
            });
        }

        // Check for conflicts with accepted reservations
        const existingAcceptedReservation = await Reservation.findOne({
            car: req.body.car,
            status: 'accepted',
            $or: [
                {
                    pickUpDate: { $lte: returnDate },
                    returnDate: { $gte: pickUpDate }
                }
            ]
        });

        if (existingAcceptedReservation) {
            return res.status(400).json({
                success: false,
                error: 'Car is already reserved for these dates'
            });
        }

        // --- Membership discount logic ---
        const user = req.user; // Already authenticated, but may not have all fields
        let membershipTier = user.membershipTier;
        let discountRate = 0;
        // If not present, fetch from DB
        if (!membershipTier) {
            const dbUser = await require('../models/user').findById(req.user._id);
            membershipTier = dbUser?.membershipTier || 'basic';
        }
        if (membershipTier === 'silver') discountRate = 0.10;
        if (membershipTier === 'gold') discountRate = 0.15;

        const days = Math.ceil((returnDate - pickUpDate) / (1000 * 60 * 60 * 24));
        let pricePerDay = car.rentalPrice;
        if (discountRate > 0) {
            pricePerDay = Math.round(car.rentalPrice * (1 - discountRate));
        }
        req.body.totalPrice = days * pricePerDay;

        const reservation = await Reservation.create(req.body);

        res.status(201).json({
            success: true,
            data: reservation
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Update reservation status
exports.updateReservationStatus = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        let conflictingReservations = [];
        
        if (!reservation) {
            return res.status(404).json({
                success: false,
                error: 'Reservation not found'
            });
        }

        // Get the car to check ownership
        const car = await Car.findById(reservation.car);
        
        // Only car owner can accept/reject reservations
        if (car.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this reservation'
            });
        }

        // If accepting the reservation, find and delete conflicting pending requests
        if (req.body.status === 'accepted') {
            conflictingReservations = await Reservation.find({
                car: reservation.car,
                status: 'pending',
                _id: { $ne: reservation._id },
                $or: [
                    {
                        pickUpDate: { $lte: reservation.returnDate },
                        returnDate: { $gte: reservation.pickUpDate }
                    }
                ]
            });

            // Delete all conflicting pending reservations
            if (conflictingReservations.length > 0) {
                await Reservation.deleteMany({
                    _id: { $in: conflictingReservations.map(r => r._id) }
                });
            }
        }

        reservation.status = req.body.status;
        await reservation.save();

        res.status(200).json({
            success: true,
            data: reservation,
            deletedConflicts: conflictingReservations.length
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get car availability for date range
exports.checkCarAvailability = async (req, res) => {
    try {
        const { carId, startDate, endDate } = req.query;

        const reservations = await Reservation.find({
            car: carId,
            status: { $in: ['pending', 'accepted'] },
            $or: [
                {
                    pickUpDate: { $lte: endDate },
                    returnDate: { $gte: startDate }
                }
            ]
        });

        const isAvailable = reservations.length === 0;

        res.status(200).json({
            success: true,
            isAvailable,
            conflictingReservations: isAvailable ? [] : reservations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// @desc    Delete reservation (cancel)
// @route   DELETE /api/v1/reservations/:id
// @access  Private (car-renter or car-owner)
exports.deleteReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({
                success: false,
                error: 'Reservation not found'
            });
        }

        // Get the car to check ownership if user is car-owner
        if (req.user.role === 'car-owner') {
            const car = await Car.findById(reservation.car);
            if (car.createdBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    error: 'Not authorized to delete this reservation'
                });
            }
        } else {
            // For car-renter, check if they own the reservation
            if (reservation.user.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    error: 'Not authorized to delete this reservation'
                });
            }

            // Only allow cancellation of pending reservations for renters
            if (reservation.status !== 'pending') {
                return res.status(400).json({
                    success: false,
                    error: 'Can only cancel pending reservations'
                });
            }
        }

        await reservation.deleteOne();

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


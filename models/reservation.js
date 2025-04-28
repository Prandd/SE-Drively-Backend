const mongoose = require('mongoose');
const User = require('./user');

const ReservationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
        required: true
    },
    pickUpDate: {
        type: Date,
        required: [true, 'Please add a pick-up date']
    },
    returnDate: {
        type: Date,
        required: [true, 'Please add a return date']
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'completed', 'cancelled'],
        default: 'pending'
    },
    rating: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rating'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure only car-renters can make reservations and handle date conflicts
ReservationSchema.pre('save', async function(next) {
    if (this.isNew) {
        const user = await User.findById(this.user);
        if (!user || user.role !== 'car-renter') {
            throw new Error('Only car-renters can make reservations');
        }
    }
    
    // Check for overlapping reservations only with accepted reservations
    if (this.isNew || (this.isModified('status') && this.status === 'accepted')) {
        const overlapping = await this.constructor.findOne({
            car: this.car,
            status: 'accepted',
            $or: [
                {
                    pickUpDate: { $lte: this.returnDate },
                    returnDate: { $gte: this.pickUpDate }
                }
            ],
            _id: { $ne: this._id }
        });

        if (overlapping) {
            throw new Error('Car is already reserved for these dates');
        }
    }
    next();
});

module.exports = mongoose.model('Reservation', ReservationSchema);

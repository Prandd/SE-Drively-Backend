const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  telephoneNumber: {
    type: String,
    required: [true, 'Please add a telephone number'],
    match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number']
  },
  role: {
    type: String,
    enum: ['car-renter', 'car-owner', 'admin'],
    default: 'car-renter',
    required: true
  },
  driverLicense: {
    type: String,
    required: function() {
      return this.role === 'car-renter'; // Only required for car-renters
    }
  },
  membershipTier: {
    type: String,
    enum: ['basic', 'silver', 'gold'],
    default: 'basic',
    required: function() {
      return this.role === 'car-renter';
    }
  },
  membershipBenefits: {
    discountRate: {
      type: Number,
      default: 0,
      required: function() {
        return this.role === 'car-renter';
      }
    },
    freeDelivery: {
      type: Boolean,
      default: false,
      required: function() {
        return this.role === 'car-renter';
      }
    },
    prioritySupport: {
      type: Boolean,
      default: false,
      required: function() {
        return this.role === 'car-renter';
      }
    },
    extraDriverOption: {
      type: Boolean,
      default: false,
      required: function() {
        return this.role === 'car-renter';
      }
    }
  },
  memberSince: {
    type: Date,
    default: Date.now,
    required: function() {
      return this.role === 'car-renter';
    }
  },
  membershipExpiryDate: {
    type: Date,
    default: () => new Date(+new Date() + 365*24*60*60*1000),
    required: function() {
      return this.role === 'car-renter';
    }
  },
  ratings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rating'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ✅ Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next(); // ✅ Prevents unnecessary hashing
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next(); // ✅ Ensures middleware completes properly
});

// ✅ Sign JWT and return
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ userId: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d' // ✅ Uses 30 days if `JWT_EXPIRE` is missing
  });
};

// ✅ Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Add method to calculate membership benefits
userSchema.methods.updateMembershipBenefits = function() {
  switch(this.membershipTier) {
    case 'gold':
      this.membershipBenefits = {
        discountRate: 0.15,
        freeDelivery: true,
        prioritySupport: true,
        extraDriverOption: true
      };
      break;
    case 'silver':
      this.membershipBenefits = {
        discountRate: 0.10,
        freeDelivery: true,
        prioritySupport: true,
        extraDriverOption: false
      };
      break;
    default: // basic
      this.membershipBenefits = {
        discountRate: 0,
        freeDelivery: false,
        prioritySupport: false,
        extraDriverOption: false
      };
  }
};

// Add pre-save middleware to update benefits when tier changes
userSchema.pre('save', async function(next) {
  if (this.isModified('membershipTier')) {
    this.updateMembershipBenefits();
  }
  next();
});

module.exports = mongoose.model('User', userSchema);

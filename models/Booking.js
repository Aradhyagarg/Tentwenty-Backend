const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Passenger first name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Passenger last name is required'],
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Passenger age is required'],
    min: 1
  },
  gender: {
    type: String,
    required: [true, 'Passenger gender is required'],
    enum: ['Male', 'Female', 'Other']
  },
  seatNumber: {
    type: String,
    required: [true, 'Seat number is required']
  }
});

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  flight: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flight',
    required: [true, 'Flight is required']
  },
  passengers: {
    type: [passengerSchema],
    validate: {
      validator: function(arr) {
        return arr.length > 0;
      },
      message: 'At least one passenger is required'
    }
  },
  totalSeats: {
    type: Number,
    required: [true, 'Total seats is required'],
    min: 1
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: 0
  },
  bookingStatus: {
    type: String,
    enum: ['confirmed', 'cancelled', 'pending'],
    default: 'confirmed'
  },
  bookingReference: {
    type: String,
    unique: true
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'pending', 'failed'],
    default: 'paid'
  }
}, {
  timestamps: true
});

bookingSchema.pre('save', function(next) {
  if (!this.bookingReference) {
    this.bookingReference = 'BK' + Date.now() + Math.floor(Math.random() * 1000);
  }

  this.passengers.forEach((p, idx) => {
    if (!p.seatNumber) {
      const row = Math.floor(idx / 6) + 1;
      const col = String.fromCharCode(65 + (idx % 6)); 
      p.seatNumber = `${row}${col}`;
    }
  });

  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  airline: {
    type: String,
    required: true,
    trim: true
  },
  airlineCode: {
    type: String,
    required: true,
    trim: true
  },
  flightNumber: {
    type: Number,
    required: true
  },
  origin: {
    type: String,
    required: true,
    trim: true
  },
  destination: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  availableSeats: {
    type: Number,
    required: true,
    min: 0
  },
  departure: {
    type: Date,
    required: true
  },
  arrival: {
    type: Date,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  operationalDays: {
    type: [Number],
    required: true
  }
}, {
  timestamps: true
});

flightSchema.index({ origin: 1, destination: 1, departure: 1 });
flightSchema.index({ price: 1 });

module.exports = mongoose.model('Flight', flightSchema);
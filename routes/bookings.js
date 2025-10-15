const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const auth = require('../middleware/auth');

router.post('/', [
  auth,
  body('flightId').notEmpty().withMessage('Flight ID is required'),
  body('passengers').isArray({ min: 1 }).withMessage('At least one passenger is required'),
  body('passengers.*.firstName').trim().notEmpty().withMessage('Passenger first name is required'),
  body('passengers.*.lastName').trim().notEmpty().withMessage('Passenger last name is required'),
  body('passengers.*.age').isInt({ min: 1 }).withMessage('Valid age is required'),
  body('passengers.*.gender').isIn(['Male', 'Female', 'Other']).withMessage('Valid gender is required'),
  body('passengers.*.seatNumber').trim().notEmpty().withMessage('Seat number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { flightId, passengers } = req.body;

    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).json({
        success: false,
        message: 'Flight not found'
      });
    }

    const totalSeats = passengers.length;
    if (flight.availableSeats < totalSeats) {
      return res.status(400).json({
        success: false,
        message: `Only ${flight.availableSeats} seats available`
      });
    }

    const seatNumbers = passengers.map(p => p.seatNumber);
    const uniqueSeats = new Set(seatNumbers);
    if (uniqueSeats.size !== seatNumbers.length) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate seat numbers in booking'
      });
    }

    const existingBookings = await Booking.find({
      flight: flightId,
      bookingStatus: { $ne: 'cancelled' },
      'passengers.seatNumber': { $in: seatNumbers }
    });

    if (existingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'One or more selected seats are already booked'
      });
    }

    const totalAmount = flight.price * totalSeats;

    const booking = await Booking.create({
      user: req.user._id,
      flight: flightId,
      passengers,
      totalSeats,
      totalAmount,
      bookingStatus: 'confirmed',
      paymentStatus: 'paid'
    });

    flight.availableSeats -= totalSeats;
    await flight.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('flight')
      .populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: populatedBooking
    });
  } catch (error) {
    console.error('Create Booking Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating booking',
      error: error.message
    });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('flight')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Get Bookings Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('flight')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this booking'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Get Booking Error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching booking',
      error: error.message
    });
  }
});

router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    booking.bookingStatus = 'cancelled';
    await booking.save();

    const flight = await Flight.findById(booking.flight);
    if (flight) {
      flight.availableSeats += booking.totalSeats;
      await flight.save();
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    console.error('Cancel Booking Error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error cancelling booking',
      error: error.message
    });
  }
});

module.exports = router;
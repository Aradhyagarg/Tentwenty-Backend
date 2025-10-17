const express = require('express');
const router = express.Router();
const { query, validationResult } = require('express-validator');
const Flight = require('../models/Flight');
const auth = require('../middleware/auth');
const Booking = require('../models/Booking');

router.get('/search', [
  auth,
  query('origin').trim().notEmpty().withMessage('Origin is required'),
  query('destination').trim().notEmpty().withMessage('Destination is required'),
  query('date').isISO8601().withMessage('Valid date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { origin, destination, date, minPrice, maxPrice, airline, sortBy } = req.query;

    const searchQuery = {
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      availableSeats: { $gt: 0 }
    };

    const searchDate = new Date(date);
    const dayOfWeek = searchDate.getDay();

    searchQuery.operationalDays = dayOfWeek;

    const startOfDay = new Date(searchDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(searchDate);
    endOfDay.setHours(23, 59, 59, 999);

    searchQuery.departure = {
      $gte: startOfDay,
      $lte: endOfDay
    };

    if (minPrice || maxPrice) {
      searchQuery.price = {};
      if (minPrice) searchQuery.price.$gte = parseFloat(minPrice);
      if (maxPrice) searchQuery.price.$lte = parseFloat(maxPrice);
    }

    if (airline) {
      searchQuery.airline = new RegExp(airline, 'i');
    }

    let sortOptions = {};
    switch (sortBy) {
      case 'price_asc':
        sortOptions.price = 1;
        break;
      case 'price_desc':
        sortOptions.price = -1;
        break;
      case 'departure_asc':
        sortOptions.departure = 1;
        break;
      case 'departure_desc':
        sortOptions.departure = -1;
        break;
      case 'duration':
        sortOptions.duration = 1;
        break;
      default:
        sortOptions.price = 1;
    }

    const flights = await Flight.find(searchQuery).sort(sortOptions);

    res.status(200).json({
      success: true,
      count: flights.length,
      data: flights
    });
  } catch (error) {
    console.error('Flight Search Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching flights',
      error: error.message
    });
  }
});

router.get('/:id/booked-seats', auth, async (req, res) => {
    try {
      const flightId = req.params.id;

      const bookings = await Booking.find({
        flight: flightId,
        bookingStatus: 'confirmed'
      }).select('passengers');

      const bookedSeats = bookings.flatMap(booking => 
        booking.passengers.map(passenger => passenger.seatNumber)
      );

      const uniqueBookedSeats = [...new Set(bookedSeats)];
  
      res.status(200).json({
        success: true,
        data: {
          flightId,
          bookedSeats: uniqueBookedSeats,
          totalBooked: uniqueBookedSeats.length
        }
      });
    } catch (error) {
      console.error('Get Booked Seats Error:', error);
      
      if (error.kind === 'ObjectId') {
        return res.status(404).json({
          success: false,
          message: 'Flight not found'
        });
      }
  
      res.status(500).json({
        success: false,
        message: 'Error fetching booked seats',
        error: error.message
      });
    }
  });  

router.get('/:id', auth, async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);

    if (!flight) {
      return res.status(404).json({
        success: false,
        message: 'Flight not found'
      });
    }

    res.status(200).json({
      success: true,
      data: flight
    });
  } catch (error) {
    console.error('Get Flight Error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Flight not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching flight',
      error: error.message
    });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const flights = await Flight.find().sort({ departure: 1 });

    res.status(200).json({
      success: true,
      count: flights.length,
      data: flights
    });
  } catch (error) {
    console.error('Get Flights Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching flights',
      error: error.message
    });
  }
});

module.exports = router;
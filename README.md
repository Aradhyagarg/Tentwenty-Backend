Flight Booking App
Live Demo:
* Backend: https://tentwenty-backend.onrender.com
* Frontend: https://tentwenty-frontend-eta.vercel.app

Tech Stack:
* Frontend: React.js, Tailwind CSS, Lucide Icons
* Backend: Node.js, Express.js
* Database: MongoDB (Atlas)
* Authentication: JWT
* Hosting: Vercel (Frontend), Render (Backend)

Project Overview
This is a full-stack flight booking application similar to popular flight booking platforms. Users can:
* Search for flights based on origin, destination, date, airline, price, and sort options
* View available flights with details (flight number, airline, departure/arrival time, price)
* Book flights by selecting passengers and seats
* See already booked seats as disabled/unavailable
* View their My Bookings page with booking history
* User authentication with login/logout functionality

Features Implemented
Frontend
* Responsive UI with Tailwind CSS
* Flight search with filters (origin, destination, date, price range, airline)
* Sorting options (Price, Departure, Duration)
* Flight card displays:
    * Flight number
    * Airline
    * Origin & destination
    * Departure & arrival date & time
    * Price per person
* Booking modal:
    * Add multiple passengers
    * Seat selection (already booked seats disabled)
    * Total price calculation
* My Bookings page shows:
    * Flight details
    * Booked seats
    * Total amount
Backend
* REST API using Node.js & Express
* Authentication with JWT
* Flight search API with filters & sorting
* Booking API to save passenger and seat details
* API to fetch already booked seats per flight
* MongoDB for storing users, flights, bookings

Project Structure
Frontend

src/
  components/FlightCard.jsx
  pages/BookingModal.jsx
  pages/FlightSearch.jsx
  pages/MyBookings.jsx
  context/AuthContext.jsx
  App.jsx
Backend

routes/
  flights.js
  bookings.js
models/
  Flight.js
  Booking.js
  User.js
middleware/
  auth.js
server.js

How It Works
1. User Registration/Login
    * JWT token is generated on login
    * Token stored in localStorage
2. Flight Search
    * Frontend sends search query to /api/flights/search
    * Backend filters flights by origin, destination, date, price, airline
    * Returns list of flights
3. Booking a Flight
    * User clicks Book on a flight card
    * Modal opens with passenger form
    * Seats that are already booked are disabled
    * User adds passenger details and selects seat(s)
    * Total price calculated automatically
    * On confirm, booking is saved via POST /api/bookings
4. My Bookings
    * Fetch bookings via GET /api/bookings
    * Displays flight info, seats booked, total amount
5. Backend Seat Logic
    * Booked seats are fetched from bookings collection
    * Unique booked seats are disabled in the frontend

How to Run Locally
Backend

cd backend
npm install
cp .env.example .env
Set environment variables:
MONGO_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret
npm start
Frontend

cd frontend
npm install
cp .env.example .env
Set environment variable:
REACT_APP_API_URL=http://localhost:8000/api
npm start

Live Links
* Frontend: https://tentwenty-frontend-eta.vercel.app
* Backend: https://tentwenty-backend.onrender.com

Future Enhancements
* Payment integration for bookings
* Email/SMS notifications after booking
* Dynamic seat map with real-time updates
* Admin panel to manage flights

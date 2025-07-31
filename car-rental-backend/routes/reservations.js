const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const Car = require('../models/Car');

// GET /api/reservations - Get all reservations
router.get('/', async (req, res) => {
    try {
        const reservations = await Reservation.findAll();
        res.json(reservations);
    } catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/reservations/date-range - Get reservations in date range
router.get('/date-range', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({ 
                error: 'startDate and endDate are required' 
            });
        }

        const reservations = await Reservation.findByDateRange(startDate, endDate);
        res.json(reservations);
    } catch (error) {
        console.error('Error fetching reservations by date range:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/reservations/car/:carId - Get reservations for a specific car
router.get('/car/:carId', async (req, res) => {
    try {
        const reservations = await Reservation.findByCarId(req.params.carId);
        res.json(reservations);
    } catch (error) {
        console.error('Error fetching car reservations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/reservations/:id - Get reservation by ID
router.get('/:id', async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found' });
        }
        res.json(reservation);
    } catch (error) {
        console.error('Error fetching reservation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/reservations - Create a new reservation
router.post('/', async (req, res) => {
    try {
        const { carId, customerName, phone, startDate, endDate } = req.body;
        
        if (!carId || !customerName || !phone || !startDate || !endDate) {
            return res.status(400).json({ 
                error: 'carId, customerName, phone, startDate, and endDate are required' 
            });
        }

        // Check if car exists
        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ error: 'Car not found' });
        }

        // Check if car is available for the requested dates
        const isAvailable = await Reservation.isCarAvailable(carId, startDate, endDate);
        if (!isAvailable) {
            return res.status(400).json({ 
                error: 'Car is not available for the requested dates' 
            });
        }

        const reservationData = {
            carId,
            licensePlate: car.licensePlate,
            model: car.model,
            customerName,
            phone,
            startDate,
            endDate
        };

        const reservation = await Reservation.create(reservationData);
        res.status(201).json(reservation);
    } catch (error) {
        console.error('Error creating reservation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/reservations/:id - Update a reservation
router.put('/:id', async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found' });
        }

        const updateData = {};
        if (req.body.customerName !== undefined) updateData.customerName = req.body.customerName;
        if (req.body.phone !== undefined) updateData.phone = req.body.phone;
        if (req.body.startDate !== undefined) updateData.startDate = req.body.startDate;
        if (req.body.endDate !== undefined) updateData.endDate = req.body.endDate;

        // If dates are being updated, check availability
        if (req.body.startDate || req.body.endDate) {
            const newStartDate = req.body.startDate || reservation.startDate;
            const newEndDate = req.body.endDate || reservation.endDate;
            
            const isAvailable = await Reservation.isCarAvailable(
                reservation.carId, 
                newStartDate, 
                newEndDate
            );
            
            if (!isAvailable) {
                return res.status(400).json({ 
                    error: 'Car is not available for the requested dates' 
                });
            }
        }

        const updatedReservation = await reservation.update(updateData);
        res.json(updatedReservation);
    } catch (error) {
        console.error('Error updating reservation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/reservations/:id - Delete a reservation
router.delete('/:id', async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found' });
        }

        await reservation.delete();
        res.json({ message: 'Reservation deleted successfully' });
    } catch (error) {
        console.error('Error deleting reservation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 
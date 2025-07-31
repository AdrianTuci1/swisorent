const express = require('express');
const router = express.Router();
const Car = require('../models/Car');

// GET /api/cars - Get all cars
router.get('/', async (req, res) => {
    try {
        const cars = await Car.findAll();
        res.json(cars);
    } catch (error) {
        console.error('Error fetching cars:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/cars/available - Get available cars for a date range
router.get('/available', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({ 
                error: 'startDate and endDate are required' 
            });
        }

        const availableCars = await Car.findAvailable(startDate, endDate);
        res.json(availableCars);
    } catch (error) {
        console.error('Error fetching available cars:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/cars/:id - Get car by ID
router.get('/:id', async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({ error: 'Car not found' });
        }
        res.json(car);
    } catch (error) {
        console.error('Error fetching car:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/cars - Create a new car
router.post('/', async (req, res) => {
    try {
        const { licensePlate, model, price, color, isActive } = req.body;
        
        if (!licensePlate || !model || !price || !color) {
            return res.status(400).json({ 
                error: 'licensePlate, model, price, and color are required' 
            });
        }

        const carData = {
            licensePlate,
            model,
            price: parseFloat(price),
            color,
            isActive: isActive !== undefined ? isActive : true
        };

        const car = await Car.create(carData);
        res.status(201).json(car);
    } catch (error) {
        console.error('Error creating car:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/cars/:id - Update a car
router.put('/:id', async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({ error: 'Car not found' });
        }

        const updateData = {};
        if (req.body.licensePlate !== undefined) updateData.licensePlate = req.body.licensePlate;
        if (req.body.model !== undefined) updateData.model = req.body.model;
        if (req.body.price !== undefined) updateData.price = parseFloat(req.body.price);
        if (req.body.color !== undefined) updateData.color = req.body.color;
        if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive;

        const updatedCar = await car.update(updateData);
        res.json(updatedCar);
    } catch (error) {
        console.error('Error updating car:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/cars/:id - Delete a car
router.delete('/:id', async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({ error: 'Car not found' });
        }

        await car.delete();
        res.json({ message: 'Car deleted successfully' });
    } catch (error) {
        console.error('Error deleting car:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 
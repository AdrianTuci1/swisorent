require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dbConfig = require('./config/database');

// Import routes
const carsRoutes = require('./routes/cars');
const reservationsRoutes = require('./routes/reservations');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database
dbConfig.initializeTables()
    .then(() => {
        console.log('Database initialized successfully');
    })
    .catch((error) => {
        console.error('Error initializing database:', error);
    });

// Routes
app.use('/api/cars', carsRoutes);
app.use('/api/reservations', reservationsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        database: 'DynamoDB'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Car Rental API',
        version: '1.0.0',
        endpoints: {
            cars: '/api/cars',
            reservations: '/api/reservations',
            health: '/health'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API Documentation: http://localhost:${PORT}`);
    console.log(`Health Check: http://localhost:${PORT}/health`);
});

module.exports = app; 
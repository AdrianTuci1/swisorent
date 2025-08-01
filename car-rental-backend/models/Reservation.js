const { PutCommand, GetCommand, QueryCommand, ScanCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const dbConfig = require('../config/database');

class Reservation {
    constructor(data = {}) {
        this.id = data.id;
        this.carId = data.carId || data.car_id;
        this.licensePlate = data.licensePlate || data.license_plate;
        this.model = data.model;
        this.customerName = data.customerName || data.customer_name;
        this.phone = data.phone;
        this.startDate = data.startDate || data.start_date;
        this.endDate = data.endDate || data.end_date;
        this.createdAt = data.createdAt || data.created_at;
    }

    // Create a new reservation
    static async create(reservationData) {
        const client = dbConfig.getDynamoClient();
        const reservation = new Reservation(reservationData);
        reservation.id = Date.now().toString();
        reservation.createdAt = new Date().toISOString();

        const command = new PutCommand({
            TableName: process.env.DYNAMODB_TABLE_RESERVATIONS,
            Item: {
                id: reservation.id,
                carId: reservation.carId,
                licensePlate: reservation.licensePlate,
                model: reservation.model,
                customerName: reservation.customerName,
                phone: reservation.phone,
                startDate: reservation.startDate,
                endDate: reservation.endDate,
                createdAt: reservation.createdAt
            }
        });

        await client.send(command);
        return reservation;
    }

    // Get reservation by ID
    static async findById(id) {
        const client = dbConfig.getDynamoClient();
        const command = new GetCommand({
            TableName: process.env.DYNAMODB_TABLE_RESERVATIONS,
            Key: { id }
        });

        const result = await client.send(command);
        return result.Item ? new Reservation(result.Item) : null;
    }

    // Get all reservations
    static async findAll() {
        const client = dbConfig.getDynamoClient();
        const command = new ScanCommand({
            TableName: process.env.DYNAMODB_TABLE_RESERVATIONS
        });

        const result = await client.send(command);
        return result.Items.map(item => new Reservation(item));
    }

    // Get reservations by car ID
    static async findByCarId(carId) {
        const client = dbConfig.getDynamoClient();
        const command = new QueryCommand({
            TableName: process.env.DYNAMODB_TABLE_RESERVATIONS,
            IndexName: 'carId-index',
            KeyConditionExpression: 'carId = :carId',
            ExpressionAttributeValues: {
                ':carId': carId
            }
        });

        const result = await client.send(command);
        return result.Items.map(item => new Reservation(item));
    }

    // Get reservations in date range
    static async findByDateRange(startDate, endDate) {
        const client = dbConfig.getDynamoClient();
        
        // Clean the date parameters by removing curly braces if present
        const cleanStartDate = startDate.replace(/[{}]/g, '');
        const cleanEndDate = endDate.replace(/[{}]/g, '');
        
        console.log('=== DEBUG: findByDateRange ===');
        console.log('Original dates:', { startDate, endDate });
        console.log('Cleaned dates:', { cleanStartDate, cleanEndDate });
        
        // First, get all reservations to see what we have
        const allReservationsCommand = new ScanCommand({
            TableName: process.env.DYNAMODB_TABLE_RESERVATIONS
        });
        const allResult = await client.send(allReservationsCommand);
        console.log('All reservations in DB:', allResult.Items.map(item => ({ 
            carId: item.carId, 
            startDate: item.startDate, 
            endDate: item.endDate 
        })));
        
        const command = new ScanCommand({
            TableName: process.env.DYNAMODB_TABLE_RESERVATIONS,
            FilterExpression: '(startDate <= :endDate AND endDate >= :startDate)',
            ExpressionAttributeValues: {
                ':startDate': cleanStartDate,
                ':endDate': cleanEndDate
            }
        });

        const result = await client.send(command);
        console.log('Filtered reservations:', result.Items.map(item => ({ 
            carId: item.carId, 
            startDate: item.startDate, 
            endDate: item.endDate 
        })));
        console.log('=== END DEBUG: findByDateRange ===');
        
        return result.Items.map(item => new Reservation(item));
    }

    // Get reservations for a specific car in date range
    static async findByCarAndDateRange(carId, startDate, endDate) {
        const client = dbConfig.getDynamoClient();
        const command = new QueryCommand({
            TableName: process.env.DYNAMODB_TABLE_RESERVATIONS,
            IndexName: 'carId-index',
            KeyConditionExpression: 'carId = :carId',
            FilterExpression: '(startDate <= :endDate AND endDate >= :startDate)',
            ExpressionAttributeValues: {
                ':carId': carId,
                ':startDate': startDate,
                ':endDate': endDate
            }
        });

        const result = await client.send(command);
        return result.Items.map(item => new Reservation(item));
    }

    // Check if car is available in date range (optionally exclude a specific reservation)
    static async isCarAvailable(carId, startDate, endDate, excludeReservationId = null) {
        const reservations = await Reservation.findByCarAndDateRange(carId, startDate, endDate);
        
        // Filter out the reservation being updated if provided
        const conflictingReservations = excludeReservationId 
            ? reservations.filter(r => r.id !== excludeReservationId)
            : reservations;
            
        console.log(`isCarAvailable for carId ${carId}: found ${conflictingReservations.length} conflicting reservations`);
        if (conflictingReservations.length > 0) {
            console.log('Conflicting reservations found:', conflictingReservations.map(r => ({ id: r.id, startDate: r.startDate, endDate: r.endDate })));
        }
        return conflictingReservations.length === 0;
    }

    // Get available cars for a date range (cars that don't have reservations in the period)
    static async findAvailableCars(startDate, endDate) {
        const client = dbConfig.getDynamoClient();
        
        // First, get all cars
        const Car = require('./Car');
        const allCars = await Car.findAll();
        
        console.log('=== DEBUG: findAvailableCars ===');
        console.log('Date range:', { startDate, endDate });
        console.log('All cars:', allCars.map(car => ({ id: car.id, model: car.model })));
        
        // Get all reservations in the date range
        const reservationsInRange = await Reservation.findByDateRange(startDate, endDate);
        console.log('Reservations in range:', reservationsInRange.map(r => ({ carId: r.carId, startDate: r.startDate, endDate: r.endDate })));
        
        // Create a set of car IDs that have reservations in the range
        const reservedCarIds = new Set(reservationsInRange.map(reservation => reservation.carId));
        console.log('Reserved car IDs:', Array.from(reservedCarIds));
        
        // Filter out cars that have reservations in the date range
        const availableCars = allCars.filter(car => !reservedCarIds.has(car.id));
        
        console.log('Available cars:', availableCars.map(car => ({ id: car.id, model: car.model })));
        console.log('=== END DEBUG ===');
        
        return availableCars;
    }

    // Update reservation
    async update(updateData) {
        const client = dbConfig.getDynamoClient();
        const updateExpressions = [];
        const expressionAttributeNames = {};
        const expressionAttributeValues = {};

        Object.keys(updateData).forEach(key => {
            if (key !== 'id') {
                updateExpressions.push(`#${key} = :${key}`);
                expressionAttributeNames[`#${key}`] = key;
                expressionAttributeValues[`:${key}`] = updateData[key];
            }
        });

        const command = new UpdateCommand({
            TableName: process.env.DYNAMODB_TABLE_RESERVATIONS,
            Key: { id: this.id },
            UpdateExpression: `SET ${updateExpressions.join(', ')}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW'
        });

        const result = await client.send(command);
        return new Reservation(result.Attributes);
    }

    // Delete reservation
    async delete() {
        const client = dbConfig.getDynamoClient();
        const command = new DeleteCommand({
            TableName: process.env.DYNAMODB_TABLE_RESERVATIONS,
            Key: { id: this.id }
        });

        await client.send(command);
        return true;
    }
}

module.exports = Reservation; 
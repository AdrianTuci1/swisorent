const { PutCommand, GetCommand, QueryCommand, ScanCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const dbConfig = require('../config/database');

class Car {
    constructor(data = {}) {
        this.id = data.id;
        this.licensePlate = data.licensePlate || data.license_plate;
        this.model = data.model;
        this.price = data.price;
        this.color = data.color;
        this.isActive = data.isActive !== undefined ? data.isActive : true;
        this.createdAt = data.createdAt || data.created_at;
        this.updatedAt = data.updatedAt || data.updated_at;
    }

    // Create a new car
    static async create(carData) {
        const client = dbConfig.getDynamoClient();
        const car = new Car(carData);
        car.id = Date.now().toString();
        car.createdAt = new Date().toISOString();
        car.updatedAt = new Date().toISOString();

        const command = new PutCommand({
            TableName: process.env.DYNAMODB_TABLE_CARS,
            Item: {
                id: car.id,
                licensePlate: car.licensePlate,
                model: car.model,
                price: car.price,
                color: car.color,
                isActive: car.isActive,
                createdAt: car.createdAt,
                updatedAt: car.updatedAt
            }
        });

        await client.send(command);
        return car;
    }

    // Get car by ID
    static async findById(id) {
        const client = dbConfig.getDynamoClient();
        const command = new GetCommand({
            TableName: process.env.DYNAMODB_TABLE_CARS,
            Key: { id }
        });

        const result = await client.send(command);
        return result.Item ? new Car(result.Item) : null;
    }

    // Get all cars
    static async findAll() {
        const client = dbConfig.getDynamoClient();
        const command = new ScanCommand({
            TableName: process.env.DYNAMODB_TABLE_CARS
        });

        const result = await client.send(command);
        return result.Items.map(item => new Car(item));
    }

    // Get available cars for a date range
    static async findAvailable(startDate, endDate) {
        const client = dbConfig.getDynamoClient();
        const command = new ScanCommand({
            TableName: process.env.DYNAMODB_TABLE_CARS,
            FilterExpression: 'isActive = :isActive',
            ExpressionAttributeValues: {
                ':isActive': true
            }
        });

        const result = await client.send(command);
        const cars = result.Items.map(item => new Car(item));
        
        // Filter out cars that have reservations in the date range
        const availableCars = [];
        for (const car of cars) {
            const hasReservation = await Car.hasReservationInRange(car.id, startDate, endDate);
            if (!hasReservation) {
                availableCars.push(car);
            }
        }
        
        return availableCars;
    }

    // Check if car has reservations in date range
    static async hasReservationInRange(carId, startDate, endDate) {
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
        return result.Items.length > 0;
    }

    // Update car
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

        updateExpressions.push('#updatedAt = :updatedAt');
        expressionAttributeNames['#updatedAt'] = 'updatedAt';
        expressionAttributeValues[':updatedAt'] = new Date().toISOString();

        const command = new UpdateCommand({
            TableName: process.env.DYNAMODB_TABLE_CARS,
            Key: { id: this.id },
            UpdateExpression: `SET ${updateExpressions.join(', ')}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW'
        });

        const result = await client.send(command);
        return new Car(result.Attributes);
    }

    // Delete car
    async delete() {
        const client = dbConfig.getDynamoClient();
        const command = new DeleteCommand({
            TableName: process.env.DYNAMODB_TABLE_CARS,
            Key: { id: this.id }
        });

        await client.send(command);
        return true;
    }
}

module.exports = Car; 
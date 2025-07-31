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
        const command = new ScanCommand({
            TableName: process.env.DYNAMODB_TABLE_RESERVATIONS,
            FilterExpression: '(startDate <= :endDate AND endDate >= :startDate)',
            ExpressionAttributeValues: {
                ':startDate': startDate,
                ':endDate': endDate
            }
        });

        const result = await client.send(command);
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

    // Check if car is available in date range
    static async isCarAvailable(carId, startDate, endDate) {
        const reservations = await Reservation.findByCarAndDateRange(carId, startDate, endDate);
        return reservations.length === 0;
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
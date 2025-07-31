require('dotenv').config();

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

class DatabaseConfig {
    constructor() {
        this.dynamoClient = null;
    }

    // DynamoDB Configuration
    getDynamoClient() {
        if (!this.dynamoClient) {
            const client = new DynamoDBClient({
                region: process.env.AWS_REGION || 'us-east-1',
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                }
            });
            
            this.dynamoClient = DynamoDBDocumentClient.from(client);
        }
        return this.dynamoClient;
    }

    // Initialize database tables
    async initializeTables() {
        console.log('DynamoDB tables should be created manually:');
        console.log('- car-rental-cars');
        console.log('- car-rental-reservations');
        console.log('');
        console.log('Table schemas:');
        console.log('');
        console.log('cars table:');
        console.log('- id (String) - Primary Key');
        console.log('- licensePlate (String)');
        console.log('- model (String)');
        console.log('- price (Number)');
        console.log('- color (String)');
        console.log('- isActive (Boolean)');
        console.log('- createdAt (String)');
        console.log('- updatedAt (String)');
        console.log('');
        console.log('reservations table:');
        console.log('- id (String) - Primary Key');
        console.log('- carId (String) - GSI Partition Key');
        console.log('- licensePlate (String)');
        console.log('- model (String)');
        console.log('- customerName (String)');
        console.log('- phone (String)');
        console.log('- startDate (String)');
        console.log('- endDate (String)');
        console.log('- createdAt (String)');
        console.log('');
        console.log('GSI: carId-index (carId as partition key)');
    }
}

module.exports = new DatabaseConfig(); 
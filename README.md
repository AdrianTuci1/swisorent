# Simple Car Rental Dashboard

It features a car table and a reservation timeline.

It can be used with Eleven Labs conversational agents.

## Features

- **Car Management**: Add, edit, and delete cars with details like license plate, model, price, and color
- **Reservation System**: Create and manage reservations with customer information
- **Availability Check**: Check car availability for specific date ranges
- **Timeline View**: Visual timeline of all reservations
- **Eleven Labs Integration**: Ready for conversational AI agents

## API Endpoints

### Cars
- `GET /api/cars` - Get all cars
- `GET /api/cars/:id` - Get car by ID
- `POST /api/cars` - Create a new car
- `PUT /api/cars/:id` - Update a car
- `DELETE /api/cars/:id` - Delete a car

### Reservations
- `GET /api/reservations` - Get all reservations
- `GET /api/reservations/date-range` - Get reservations in date range
- `GET /api/reservations/available-cars` - Get available cars for a date range
- `GET /api/reservations/car/:carId` - Get reservations for a specific car
- `GET /api/reservations/:id` - Get reservation by ID
- `POST /api/reservations` - Create a new reservation
- `PUT /api/reservations/:id` - Update a reservation
- `DELETE /api/reservations/:id` - Delete a reservation

## Eleven Labs Tool Configuration

### Tool 1: Check Car Reservations

**Name**: `check_car_reservations`  
**Description**: Get all reservations for a specific car by its ID.  
**Method**: GET  
**URL**: `/api/reservations/car/{carId}`  
**Path Parameters**:
- `carId` - ID of the car to check reservations for
**Query Parameters**: None

### Tool 2: Get Available Cars from Reservations

**Name**: `get_available_cars_from_reservations`  
**Description**: Get available cars for a specific date range by checking the reservations table. Returns cars that don't have any reservations in the specified period.  
**Method**: GET  
**URL**: `/api/reservations/available-cars?startDate={startDate}&endDate={endDate}`  
**Path Parameters**: None  
**Query Parameters**:
- `startDate` - Start date for the rental period (YYYY-MM-DD format)
- `endDate` - End date for the rental period (YYYY-MM-DD format)

### Tool 3: Create Reservation

**Name**: `create_reservation`  
**Description**: Create a new car reservation for a customer. The system will automatically find the car by license plate and check if it's available for the requested dates before creating the reservation.  
**Method**: POST  
**URL**: `/api/reservations`  
**Path Parameters**: None  
**Body Parameters**:
- `licensePlate` - License plate of the car to be reserved
- `customerName` - Name of the customer making the reservation
- `phone` - Phone number of the customer
- `startDate` - Start date for the rental period (YYYY-MM-DD format)
- `endDate` - End date for the rental period (YYYY-MM-DD format)

## Technical Details

### Database
- Uses AWS DynamoDB for data storage
- Separate tables for cars and reservations
- Optimized queries for availability checking

### Availability Logic
- Car availability is determined by checking reservations in the specified date range
- A car is available if it has no overlapping reservations
- The system uses efficient queries to filter out reserved cars

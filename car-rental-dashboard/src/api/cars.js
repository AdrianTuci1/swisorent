const API_BASE_URL = import.meta.env.VITE_RENTAL_API;

class CarsApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/cars`;
  }

  // Generic request method
  async request(endpoint = '', options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Cars API request failed:', error);
      throw error;
    }
  }

  // Get all cars
  async getCars() {
    return this.request();
  }

  // Get car by ID
  async getCar(id) {
    return this.request(`/${id}`);
  }

  // Get available cars for a date range
  async getAvailableCars(startDate, endDate) {
    const params = new URLSearchParams({
      startDate,
      endDate,
    });
    return this.request(`/available?${params}`);
  }

  // Create a new car
  async createCar(carData) {
    return this.request('', {
      method: 'POST',
      body: JSON.stringify({
        licensePlate: carData.registrationNumber,
        model: carData.model,
        price: carData.price || 0,
        color: carData.color,
        isActive: true,
      }),
    });
  }

  // Update an existing car
  async updateCar(id, carData) {
    return this.request(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        licensePlate: carData.registrationNumber,
        model: carData.model,
        price: carData.price || 0,
        color: carData.color,
        isActive: carData.isActive !== undefined ? carData.isActive : true,
      }),
    });
  }

  // Delete a car
  async deleteCar(id) {
    return this.request(`/${id}`, {
      method: 'DELETE',
    });
  }
}

// Create and export a singleton instance
const carsApiService = new CarsApiService();
export default carsApiService; 
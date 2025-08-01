const API_BASE_URL = import.meta.env.VITE_RENTAL_API;

class ReservationsApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/reservations`;
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
      console.error('Reservations API request failed:', error);
      throw error;
    }
  }

  // Get all reservations
  async getReservations() {
    return this.request();
  }

  // Get reservation by ID
  async getReservation(id) {
    return this.request(`/${id}`);
  }

  // Get reservations by date range
  async getReservationsByDateRange(startDate, endDate) {
    const params = new URLSearchParams({
      startDate,
      endDate,
    });
    return this.request(`/date-range?${params}`);
  }

  // Get reservations by car ID
  async getReservationsByCar(carId) {
    return this.request(`/car/${carId}`);
  }

  // Create a new reservation
  async createReservation(reservationData) {
    return this.request('', {
      method: 'POST',
      body: JSON.stringify({
        carId: reservationData.carId,
        customerName: reservationData.customerName,
        phone: reservationData.phone || '',
        startDate: reservationData.startDate,
        endDate: reservationData.endDate,
      }),
    });
  }

  // Update an existing reservation
  async updateReservation(id, reservationData) {
    return this.request(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        carId: reservationData.carId,
        licensePlate: reservationData.licensePlate,
        model: reservationData.model,
        customerName: reservationData.customerName,
        phone: reservationData.phone || '',
        startDate: reservationData.startDate,
        endDate: reservationData.endDate,
      }),
    });
  }

  // Delete a reservation
  async deleteReservation(id) {
    return this.request(`/${id}`, {
      method: 'DELETE',
    });
  }
}

// Create and export a singleton instance
const reservationsApiService = new ReservationsApiService();
export default reservationsApiService; 
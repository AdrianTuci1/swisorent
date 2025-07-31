

<template>
  <div id="app">
    <Sidebar 
      @view-changed="setActiveView" 
      @sidebar-toggle="handleSidebarToggle"
      ref="sidebar"
    />
    
    <main class="main-content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <div class="content-wrapper">
        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading data...</p>
        </div>
        
        <!-- Error State -->
        <div v-else-if="error" class="error-container">
          <p class="error-message">{{ error }}</p>
          <button @click="loadData" class="retry-button">Retry</button>
        </div>
        
        <!-- Content -->
        <div v-else>
          <!-- Timeline View -->
          <Timeline 
            v-if="activeView === 'timeline'"
            :cars="cars"
            :reservations="reservations"
            @show-add-modal="showReservationModal = true"
            @delete-reservation="deleteReservation"
            @cell-click="handleCellClick"
          />
          
          <!-- Cars Table View -->
          <CarsTable 
            v-if="activeView === 'cars'"
            :cars="cars"
            @show-add-modal="showCarModal = true"
            @edit-car="editCar"
            @delete-car="deleteCar"
          />
        </div>
      </div>
    </main>

    <!-- Reservation Modal -->
    <ReservationModal 
      :show="showReservationModal"
      :cars="cars"
      @close="showReservationModal = false"
      @submit="addReservation"
    />

    <!-- Car Modal -->
    <CarModal 
      :show="showCarModal"
      :editing-car="editingCar"
      @close="closeCarModal"
      @submit="handleCarSubmit"
    />
  </div>
</template>

<script>
import Sidebar from './components/Sidebar/Sidebar.vue'
import Timeline from './components/Timeline/Timeline.vue'
import CarsTable from './components/CarsTable/CarsTable.vue'
import ReservationModal from './components/Modals/ReservationModal.vue'
import CarModal from './components/Modals/CarModal.vue'
import { getRandomColor } from './utils/icons.js'
import { carsApi, reservationsApi } from './api/index.js'

export default {
  name: 'App',
  components: {
    Sidebar,
    Timeline,
    CarsTable,
    ReservationModal,
    CarModal
  },
  data() {
    return {
      activeView: 'timeline',
      sidebarCollapsed: false,
      showReservationModal: false,
      showCarModal: false,
      editingCar: null,
      cars: [],
      reservations: [],
      loading: false,
      error: null
    }
  },
  async mounted() {
    await this.loadData();
  },
  methods: {
    async loadData() {
      this.loading = true;
      this.error = null;
      try {
        const [carsData, reservationsData] = await Promise.all([
          carsApi.getCars(),
          reservationsApi.getReservations()
        ]);
        
        // Transform backend data to frontend format
        this.cars = carsData.map(car => ({
          id: car.id,
          registrationNumber: car.licensePlate,
          model: car.model,
          color: car.color,
          price: car.price,
          isActive: car.isActive,
          year: car.year || 2020,
          fuelType: car.fuelType || 'Benzină',
          transmission: car.transmission || 'Manual',
          seats: car.seats || 5
        }));
        
        this.reservations = reservationsData.map(reservation => ({
          id: reservation.id,
          carId: reservation.carId,
          carRegistration: reservation.licensePlate,
          customerName: reservation.customerName,
          startDate: reservation.startDate,
          endDate: reservation.endDate,
          phone: reservation.phone,
          color: getRandomColor()
        }));
      } catch (error) {
        console.error('Failed to load data:', error);
        this.error = 'Failed to load data from server';
      } finally {
        this.loading = false;
      }
    },
    
    setActiveView(view) {
      this.activeView = view
    },
    
    handleSidebarToggle(isCollapsed) {
      this.sidebarCollapsed = isCollapsed
    },
    
    async addReservation(reservationData) {
      try {
        const newReservation = await reservationsApi.createReservation(reservationData);
        
        // Add the new reservation to the local state
        this.reservations.push({
          id: newReservation.id,
          carId: newReservation.carId,
          carRegistration: newReservation.licensePlate,
          customerName: newReservation.customerName,
          startDate: newReservation.startDate,
          endDate: newReservation.endDate,
          phone: newReservation.phone,
          color: getRandomColor()
        });
      } catch (error) {
        console.error('Failed to create reservation:', error);
        alert('Failed to create reservation. Please try again.');
      }
    },
    
    async deleteReservation(id) {
      if (confirm('Ești sigur că vrei să ștergi această rezervare?')) {
        try {
          await reservationsApi.deleteReservation(id);
          this.reservations = this.reservations.filter(r => r.id !== id);
        } catch (error) {
          console.error('Failed to delete reservation:', error);
          alert('Failed to delete reservation. Please try again.');
        }
      }
    },
    
    handleCellClick(data) {
      console.log('Cell clicked:', data)
      // Could be used for quick reservation creation
    },
    
    editCar(car) {
      this.editingCar = car
      this.showCarModal = true
    },
    
    async deleteCar(carId) {
      if (confirm('Ești sigur că vrei să ștergi această mașină?')) {
        try {
          await carsApi.deleteCar(carId);
          this.cars = this.cars.filter(c => c.id !== carId);
          // Also remove related reservations
          this.reservations = this.reservations.filter(r => r.carId !== carId);
        } catch (error) {
          console.error('Failed to delete car:', error);
          alert('Failed to delete car. Please try again.');
        }
      }
    },
    
    async handleCarSubmit(carData) {
      try {
        if (this.editingCar) {
          // Update existing car
          const updatedCar = await carsApi.updateCar(this.editingCar.id, carData);
          const index = this.cars.findIndex(c => c.id === this.editingCar.id);
          if (index !== -1) {
            this.cars[index] = {
              id: updatedCar.id,
              registrationNumber: updatedCar.licensePlate,
              model: updatedCar.model,
              color: updatedCar.color,
              price: updatedCar.price,
              isActive: updatedCar.isActive,
              year: carData.year || 2020,
              fuelType: carData.fuelType || 'Benzină',
              transmission: carData.transmission || 'Manual',
              seats: carData.seats || 5
            };
          }
        } else {
          // Add new car
          const newCar = await carsApi.createCar(carData);
          this.cars.push({
            id: newCar.id,
            registrationNumber: newCar.licensePlate,
            model: newCar.model,
            color: newCar.color,
            price: newCar.price,
            isActive: newCar.isActive,
            year: carData.year || 2020,
            fuelType: carData.fuelType || 'Benzină',
            transmission: carData.transmission || 'Manual',
            seats: carData.seats || 5
          });
        }
      } catch (error) {
        console.error('Failed to save car:', error);
        alert('Failed to save car. Please try again.');
      }
    },
    
    closeCarModal() {
      this.showCarModal = false
      this.editingCar = null
    }
  }
}
</script>

<style>
/* Global styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f6fa;
}

#app {
  min-height: 100vh;
  display: flex;
  width: 100%;
}

.main-content {
  flex: 1;
  margin-left: 250px;
  transition: margin-left 0.3s ease;
  min-height: 100vh;
  background-color: #f5f6fa;
  overflow-x: auto;
  overflow-y: hidden;
}

.main-content.sidebar-collapsed {
  margin-left: 60px;
}

.content-wrapper {
  max-width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  overflow-x: auto;
  overflow-y: hidden;
}

/* Utility classes */
.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.mb-1 { margin-bottom: 0.5rem; }
.mb-2 { margin-bottom: 1rem; }
.mb-3 { margin-bottom: 1.5rem; }

.mt-1 { margin-top: 0.5rem; }
.mt-2 { margin-top: 1rem; }
.mt-3 { margin-top: 1.5rem; }

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Focus styles for accessibility */
button:focus,
input:focus,
select:focus {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
}

/* Loading and Error States */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1976d2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
}

.error-message {
  color: #d32f2f;
  font-size: 1.1rem;
  text-align: center;
}

.retry-button {
  background-color: #1976d2;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.retry-button:hover {
  background-color: #1565c0;
}

/* Responsive breakpoints */
@media (max-width: 1200px) {
  .content-wrapper {
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 60px;
  }
  
  .main-content.sidebar-collapsed {
    margin-left: 60px;
  }
  
  .content-wrapper {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .content-wrapper {
    padding: 0.5rem;
  }
}
</style>



<template>
  <div id="app">
    <Sidebar 
      @view-changed="setActiveView" 
      @sidebar-toggle="handleSidebarToggle"
      ref="sidebar"
    />
    
    <main class="main-content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <div class="content-wrapper">
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
import { carData, reservationData } from './utils/carData.js'

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
      cars: carData,
      reservations: reservationData
    }
  },
  methods: {
    setActiveView(view) {
      this.activeView = view
    },
    
    handleSidebarToggle(isCollapsed) {
      this.sidebarCollapsed = isCollapsed
    },
    
    addReservation(reservationData) {
      const reservation = {
        id: Date.now(),
        ...reservationData,
        color: getRandomColor()
      }
      this.reservations.push(reservation)
    },
    
    deleteReservation(id) {
      if (confirm('Ești sigur că vrei să ștergi această rezervare?')) {
        this.reservations = this.reservations.filter(r => r.id !== id)
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
    
    deleteCar(registrationNumber) {
      if (confirm('Ești sigur că vrei să ștergi această mașină?')) {
        this.cars = this.cars.filter(c => c.registrationNumber !== registrationNumber)
        // Also remove related reservations
        this.reservations = this.reservations.filter(r => r.carRegistration !== registrationNumber)
      }
    },
    
    handleCarSubmit(carData) {
      if (this.editingCar) {
        // Update existing car
        const index = this.cars.findIndex(c => c.registrationNumber === this.editingCar.registrationNumber)
        if (index !== -1) {
          this.cars[index] = { ...carData }
        }
      } else {
        // Add new car
        this.cars.push({ ...carData })
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

<template>
  <div :class="styles.timelineContainer">
    <div :class="styles.timelineHeader">
      <h2 :class="styles.timelineTitle">Timeline Rezervări</h2>
      <div :class="styles.timelineControls">
        <div :class="styles.dateFilter">
          <label for="startDate" :class="styles.dateFilterLabel">Data început:</label>
          <input 
            type="date" 
            id="startDate" 
            v-model="startDate" 
            @change="updateTimeline"
            :class="styles.dateFilterInput"
          >
          <label for="endDate" :class="styles.dateFilterLabel">Data sfârșit:</label>
          <input 
            type="date" 
            id="endDate" 
            v-model="endDate" 
            @change="updateTimeline"
            :class="styles.dateFilterInput"
          >
        </div>
        <button @click="showAddModal" :class="styles.addBtn">
          + Adaugă Rezervare
        </button>
      </div>
    </div>
    
    <div :class="styles.timelineView" ref="timelineView">
      <div :class="[styles.timelineTableContainer, { 
             [styles.dragging]: isDragging,
             [styles.scrollable]: isScrollable
           }]" 
           ref="timelineContainer">
        <div :class="styles.timelineTable">
          <div :class="styles.timelineTableHeader">
            <div :class="[styles.headerCell, styles.headerCellFirst, styles.stickyCell]">Număr Matriculare</div>
            <div 
              v-for="date in timelineDates" 
              :key="date" 
              :class="[styles.headerCell, styles.dateCell]"
            >
              {{ formatDate(date) }}
            </div>
          </div>
          
          <div :class="styles.timelineTableBody">
            <div 
              v-for="car in cars" 
              :key="car.registrationNumber" 
              :class="styles.timelineRow"
            >
              <div :class="[styles.carInfo, styles.stickyCell]">
                <strong :class="styles.carInfoStrong">{{ car.registrationNumber }}</strong>
                <small :class="styles.carInfoSmall">{{ car.model }} - {{ car.color }}</small>
              </div>
              <div 
                v-for="date in timelineDates" 
                :key="`${car.registrationNumber}-${date}`" 
                :class="styles.timelineCell"
                @click="handleCellClick(car.registrationNumber, date)"
              >
                <!-- Render continuous reservations -->
                <div 
                  v-for="reservation in getReservationsForCarAndDate(car.registrationNumber, date)"
                  :key="reservation.id"
                  :class="[styles.reservationItem, {
                    [styles.reservationStart]: isReservationStart(car.registrationNumber, date, reservation),
                    [styles.reservationMiddle]: isReservationMiddle(car.registrationNumber, date, reservation),
                    [styles.reservationEnd]: isReservationEnd(car.registrationNumber, date, reservation),
                    [styles.reservationSingle]: isReservationSingle(car.registrationNumber, date, reservation)
                  }]"
                  :style="{ 
                    backgroundColor: reservation.color,
                    width: getReservationWidth(car.registrationNumber, date, reservation)
                  }"
                  @click="handleReservationClick($event, reservation.id)"
                  :title="`${reservation.customerName} - ${reservation.price} RON`"
                >
                  <span v-if="isReservationStart(car.registrationNumber, date, reservation) || isReservationSingle(car.registrationNumber, date, reservation)">
                    {{ reservation.customerName }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import styles from './Timeline.module.css'
import { TimelineDrag } from '../../utils/timelineDrag.js'

export default {
  name: 'Timeline',
  props: {
    cars: {
      type: Array,
      required: true
    },
    reservations: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      styles,
      startDate: '',
      endDate: '',
      isDragging: false,
      isScrollable: false,
      timelineDrag: null
    }
  },
  computed: {
    timelineDates() {
      if (!this.startDate || !this.endDate) return []
      
      const dates = []
      const currentDate = new Date(this.startDate)
      const endDate = new Date(this.endDate)
      
      while (currentDate <= endDate) {
        dates.push(new Date(currentDate).toISOString().split('T')[0])
        currentDate.setDate(currentDate.getDate() + 1)
      }
      
      return dates
    }
  },
  mounted() {
    this.initializeDates()
    this.$nextTick(() => {
      this.initTimelineDrag()
      this.checkScrollable()
    })
  },
  beforeDestroy() {
    if (this.timelineDrag) {
      this.timelineDrag.destroy()
    }
  },
  methods: {
    initializeDates() {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      
      const threeWeeksLater = new Date()
      threeWeeksLater.setDate(threeWeeksLater.getDate() + 21)
      
      this.startDate = yesterday.toISOString().split('T')[0]
      this.endDate = threeWeeksLater.toISOString().split('T')[0]
    },
    
    initTimelineDrag() {
      if (this.$refs.timelineContainer) {
        this.timelineDrag = new TimelineDrag(this.$refs.timelineContainer, {
          onDragStart: () => {
            this.isDragging = true
          },
          onDragEnd: () => {
            this.isDragging = false
          },
          onScroll: (scrollLeft, scrollTop) => {
            // Update scroll position if needed
          },
          cssClasses: {
            timelineTable: this.styles.timelineTable,
            reservationItem: this.styles.reservationItem
          }
        })
      }
    },
    
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('ro-RO', { 
        day: '2-digit', 
        month: '2-digit' 
      })
    },
    
    updateTimeline() {
      // Reset scroll position when timeline changes
      if (this.$refs.timelineContainer) {
        this.$refs.timelineContainer.scrollLeft = 0
        this.$refs.timelineContainer.scrollTop = 0
      }
      this.$nextTick(() => {
        this.checkScrollable()
      })
    },
    
    getReservationsForCarAndDate(carRegistration, date) {
      return this.reservations.filter(reservation => {
        return reservation.carRegistration === carRegistration &&
               date >= reservation.startDate &&
               date <= reservation.endDate
      })
    },
    
    isReservationStart(carRegistration, date, reservation) {
      return reservation.startDate === date
    },
    
    isReservationEnd(carRegistration, date, reservation) {
      return reservation.endDate === date
    },
    
    isReservationMiddle(carRegistration, date, reservation) {
      return reservation.startDate < date && reservation.endDate > date
    },
    
    isReservationSingle(carRegistration, date, reservation) {
      return reservation.startDate === reservation.endDate
    },
    

    
    getReservationWidth(carRegistration, date, reservation) {
      if (this.isReservationSingle(carRegistration, date, reservation)) {
        return '100%'
      }
      
      // For all multi-day reservations, show them in each cell
      return '100%'
    },
    
    handleCellClick(carRegistration, date) {
      this.$emit('cell-click', { carRegistration, date })
    },
    
    deleteReservation(id) {
      this.$emit('delete-reservation', id)
    },
    

    
    handleReservationClick(event, reservationId) {
      // Simple click handler - if we're not dragging, delete the reservation
      if (!this.isDragging) {
        this.deleteReservation(reservationId)
      }
    },
    
    showAddModal() {
      this.$emit('show-add-modal')
    },
    
    checkScrollable() {
      const container = this.$refs.timelineContainer
      if (!container) return
      
      const table = container.querySelector(`.${this.styles.timelineTable}`)
      if (!table) return
      
      const tableWidth = table.scrollWidth
      const containerWidth = container.clientWidth
      const tableHeight = table.scrollHeight
      const containerHeight = container.clientHeight
      
      this.isScrollable = tableWidth > containerWidth || tableHeight > containerHeight
    }
  }
}
</script> 
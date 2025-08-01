<template>
  <div v-if="show" :class="styles.drawerOverlay" @click="closeDrawer">
    <div :class="styles.drawer" @click.stop>
      <div :class="styles.drawerHeader">
        <h3 :class="styles.drawerTitle">{{ isEditing ? 'Editează Rezervarea' : 'Detalii Rezervare' }}</h3>
        <button @click="closeDrawer" :class="styles.closeBtn">×</button>
      </div>
      
      <!-- View Mode -->
      <div :class="styles.drawerContent" v-if="reservation && !isEditing">
        <div :class="styles.reservationInfo">
          <div :class="styles.infoSection">
            <h4 :class="styles.infoSectionTitle">Informații Client</h4>
            <div :class="styles.infoItem">
              <span :class="styles.infoLabel">Nume:</span>
              <span :class="styles.infoValue">{{ reservation.customerName }}</span>
            </div>
            <div :class="styles.infoItem">
              <span :class="styles.infoLabel">Telefon:</span>
              <span :class="styles.infoValue">{{ reservation.phone }}</span>
            </div>
          </div>
          
          <div :class="styles.infoSection">
            <h4 :class="styles.infoSectionTitle">Informații Mașină</h4>
            <div :class="styles.infoItem">
              <span :class="styles.infoLabel">Număr Matriculare:</span>
              <span :class="styles.infoValue">{{ reservation.carRegistration }}</span>
            </div>
            <div :class="styles.infoItem" v-if="carInfo">
              <span :class="styles.infoLabel">Model:</span>
              <span :class="styles.infoValue">{{ carInfo.model }}</span>
            </div>
            <div :class="styles.infoItem" v-if="carInfo">
              <span :class="styles.infoLabel">Culoare:</span>
              <span :class="styles.infoValue">{{ carInfo.color }}</span>
            </div>
          </div>
          
          <div :class="styles.infoSection">
            <h4 :class="styles.infoSectionTitle">Perioada Rezervare</h4>
            <div :class="styles.infoItem">
              <span :class="styles.infoLabel">Data început:</span>
              <span :class="styles.infoValue">{{ formatDate(reservation.startDate) }}</span>
            </div>
            <div :class="styles.infoItem">
              <span :class="styles.infoLabel">Data sfârșit:</span>
              <span :class="styles.infoValue">{{ formatDate(reservation.endDate) }}</span>
            </div>
            <div :class="styles.infoItem">
              <span :class="styles.infoLabel">Durată:</span>
              <span :class="styles.infoValue">{{ getDuration() }} zile</span>
            </div>
          </div>
          
          <div :class="styles.infoSection" v-if="reservation.price">
            <h4 :class="styles.infoSectionTitle">Informații Financiare</h4>
            <div :class="styles.infoItem">
              <span :class="styles.infoLabel">Preț:</span>
              <span :class="styles.infoValue">{{ reservation.price }} RON</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Edit Mode -->
      <div :class="styles.drawerContent" v-if="reservation && isEditing">
        <form @submit.prevent="saveChanges" :class="styles.editForm">
          <div :class="styles.formSection">
            <h4 :class="styles.formSectionTitle">Informații Client</h4>
            <div :class="styles.formGroup">
              <label for="editCustomerName" :class="styles.formLabel">Nume Client:</label>
              <input 
                type="text" 
                id="editCustomerName" 
                v-model="editForm.customerName" 
                required 
                :class="styles.formInput"
              >
            </div>
            <div :class="styles.formGroup">
              <label for="editPhone" :class="styles.formLabel">Telefon:</label>
              <input 
                type="tel" 
                id="editPhone" 
                v-model="editForm.phone" 
                required 
                :class="styles.formInput"
              >
            </div>
          </div>
          
          <div :class="styles.formSection">
            <h4 :class="styles.formSectionTitle">Informații Mașină</h4>
            <div :class="styles.formGroup">
              <label for="editCarSelect" :class="styles.formLabel">Mașină:</label>
              <select 
                id="editCarSelect" 
                v-model="editForm.carRegistration" 
                required 
                :class="styles.formSelect"
              >
                <option value="">Selectează mașina</option>
                <option v-for="car in cars" :key="car.registrationNumber" :value="car.registrationNumber">
                  {{ car.registrationNumber }} - {{ car.model }}
                </option>
              </select>
            </div>
          </div>
          
          <div :class="styles.formSection">
            <h4 :class="styles.formSectionTitle">Perioada Rezervare</h4>
            <div :class="styles.formGroup">
              <label for="editStartDate" :class="styles.formLabel">Data început:</label>
              <input 
                type="date" 
                id="editStartDate" 
                v-model="editForm.startDate" 
                required 
                :class="styles.formInput"
              >
            </div>
            <div :class="styles.formGroup">
              <label for="editEndDate" :class="styles.formLabel">Data sfârșit:</label>
              <input 
                type="date" 
                id="editEndDate" 
                v-model="editForm.endDate" 
                required 
                :class="styles.formInput"
              >
            </div>
          </div>
        </form>
      </div>
      
      <!-- View Mode Actions -->
      <div :class="styles.drawerActions" v-if="!isEditing">
        <button @click="startEditing" :class="[styles.actionBtn, styles.editBtn]">
          ✏️ Editează Rezervarea
        </button>
        <button @click="showDeleteConfirmation" :class="[styles.actionBtn, styles.deleteBtn]">
          🗑️ Șterge Rezervarea
        </button>
        <button @click="closeDrawer" :class="[styles.actionBtn, styles.cancelBtn]">
          Închide
        </button>
      </div>
      
      <!-- Edit Mode Actions -->
      <div :class="styles.drawerActions" v-if="isEditing">
        <button @click="saveChanges" :class="[styles.actionBtn, styles.saveBtn]">
          💾 Salvează Modificările
        </button>
        <button @click="cancelEditing" :class="[styles.actionBtn, styles.cancelBtn]">
          ❌ Anulează
        </button>
      </div>
    </div>
    
    <!-- Confirmation Dialog for Delete -->
    <div v-if="showDeleteDialog" :class="styles.confirmationDialog">
      <h4 :class="styles.confirmationTitle">Confirmă ștergerea</h4>
      <p :class="styles.confirmationMessage">
        Ești sigur că vrei să ștergi această rezervare? Această acțiune nu poate fi anulată.
      </p>
      <div :class="styles.confirmationActions">
        <button @click="cancelDelete" :class="[styles.confirmationBtn, styles.cancelDeleteBtn]">
          Anulează
        </button>
        <button @click="confirmDelete" :class="[styles.confirmationBtn, styles.confirmDeleteBtn]">
          Șterge
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import styles from './Drawer.module.css'

export default {
  name: 'ReservationDrawer',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    reservation: {
      type: Object,
      default: null
    },
    cars: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      styles,
      showDeleteDialog: false,
      isEditing: false,
      editForm: {
        customerName: '',
        phone: '',
        carRegistration: '',
        startDate: '',
        endDate: ''
      }
    }
  },
  computed: {
    carInfo() {
      if (!this.reservation || !this.cars) return null
      return this.cars.find(car => car.registrationNumber === this.reservation.carRegistration)
    }
  },
  methods: {
    closeDrawer() {
      this.$emit('close')
      this.showDeleteDialog = false
    },
    
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('ro-RO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    
    getDuration() {
      if (!this.reservation || !this.reservation.startDate || !this.reservation.endDate) return 0
      
      const startDate = new Date(this.reservation.startDate)
      const endDate = new Date(this.reservation.endDate)
      const diffTime = Math.abs(endDate - startDate)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      return diffDays + 1 // Include both start and end date
    },
    
    startEditing() {
      this.isEditing = true
      this.populateEditForm()
    },
    
    cancelEditing() {
      this.isEditing = false
      this.resetEditForm()
    },
    
    populateEditForm() {
      if (this.reservation) {
        this.editForm = {
          customerName: this.reservation.customerName,
          phone: this.reservation.phone || '',
          carRegistration: this.reservation.carRegistration,
          startDate: this.reservation.startDate,
          endDate: this.reservation.endDate
        }
      }
    },
    
    resetEditForm() {
      this.editForm = {
        customerName: '',
        phone: '',
        carRegistration: '',
        startDate: '',
        endDate: ''
      }
    },
    
    saveChanges() {
      // Validate form data
      if (!this.editForm.carRegistration) {
        alert('Te rog selectează o mașină')
        return
      }
      
      if (!this.editForm.customerName.trim()) {
        alert('Te rog introdu numele clientului')
        return
      }
      
      if (!this.editForm.phone.trim()) {
        alert('Te rog introdu numărul de telefon')
        return
      }
      
      if (!this.editForm.startDate) {
        alert('Te rog selectează data de început')
        return
      }
      
      if (!this.editForm.endDate) {
        alert('Te rog selectează data de sfârșit')
        return
      }
      
      if (new Date(this.editForm.startDate) >= new Date(this.editForm.endDate)) {
        alert('Data de sfârșit trebuie să fie după data de început')
        return
      }
      
      // Emit update event with reservation ID and form data
      this.$emit('update', {
        id: this.reservation.id,
        ...this.editForm
      })
      
      this.isEditing = false
      this.resetEditForm()
    },
    
    showDeleteConfirmation() {
      this.showDeleteDialog = true
    },
    
    cancelDelete() {
      this.showDeleteDialog = false
    },
    
    confirmDelete() {
      this.$emit('delete', this.reservation.id)
      this.showDeleteDialog = false
      this.closeDrawer()
    }
  }
}
</script> 
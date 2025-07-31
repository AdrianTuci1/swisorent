<template>
  <div v-if="show" :class="styles.modalOverlay" @click="closeModal">
    <div :class="styles.modal" @click.stop>
      <div :class="styles.modalHeader">
        <h3 :class="styles.modalTitle">Adaugă Rezervare</h3>
        <button @click="closeModal" :class="styles.closeBtn">×</button>
      </div>
      
      <form @submit.prevent="submitForm" :class="styles.modalForm">
        <div :class="styles.formGroup">
          <label for="carSelect" :class="styles.formLabel">Mașină:</label>
          <select id="carSelect" v-model="formData.carRegistration" required :class="styles.formSelect">
            <option value="">Selectează mașina</option>
            <option v-for="car in cars" :key="car.registrationNumber" :value="car.registrationNumber">
              {{ car.registrationNumber }} - {{ car.model }}
            </option>
          </select>
        </div>
        
        <div :class="styles.formGroup">
          <label for="customerName" :class="styles.formLabel">Nume Client:</label>
          <input type="text" id="customerName" v-model="formData.customerName" required :class="styles.formInput">
        </div>
        
        <div :class="styles.formGroup">
          <label for="startDateRes" :class="styles.formLabel">Data început:</label>
          <input type="date" id="startDateRes" v-model="formData.startDate" required :class="styles.formInput">
        </div>
        
        <div :class="styles.formGroup">
          <label for="endDateRes" :class="styles.formLabel">Data sfârșit:</label>
          <input type="date" id="endDateRes" v-model="formData.endDate" required :class="styles.formInput">
        </div>
        
        <div :class="styles.formGroup">
          <label for="price" :class="styles.formLabel">Preț (RON):</label>
          <input type="number" id="price" v-model="formData.price" required min="0" :class="styles.formInput">
        </div>
        
        <div :class="styles.modalActions">
          <button type="button" @click="closeModal" :class="styles.cancelBtn">Anulează</button>
          <button type="submit" :class="styles.submitBtn">Adaugă</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import styles from './Modal.module.css'

export default {
  name: 'ReservationModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    cars: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      styles,
      formData: {
        carRegistration: '',
        customerName: '',
        startDate: '',
        endDate: '',
        price: 0
      }
    }
  },
  methods: {
    closeModal() {
      this.$emit('close')
      this.resetForm()
    },
    
    submitForm() {
      this.$emit('submit', { ...this.formData })
      this.closeModal()
    },
    
    resetForm() {
      this.formData = {
        carRegistration: '',
        customerName: '',
        startDate: '',
        endDate: '',
        price: 0
      }
    }
  }
}
</script> 
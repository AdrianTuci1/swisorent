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
          <label for="phone" :class="styles.formLabel">Telefon:</label>
          <input type="tel" id="phone" v-model="formData.phone" required :class="styles.formInput">
        </div>
        
        <div :class="styles.formGroup">
          <label for="startDateRes" :class="styles.formLabel">Data început:</label>
          <input type="date" id="startDateRes" v-model="formData.startDate" required :class="styles.formInput">
        </div>
        
        <div :class="styles.formGroup">
          <label for="endDateRes" :class="styles.formLabel">Data sfârșit:</label>
          <input type="date" id="endDateRes" v-model="formData.endDate" required :class="styles.formInput">
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
        phone: '',
        startDate: '',
        endDate: ''
      }
    }
  },
  methods: {
    closeModal() {
      this.$emit('close')
      this.resetForm()
    },
    
    submitForm() {
      // Validate form data
      if (!this.formData.carRegistration) {
        alert('Te rog selectează o mașină');
        return;
      }
      
      if (!this.formData.customerName.trim()) {
        alert('Te rog introdu numele clientului');
        return;
      }
      
      if (!this.formData.phone.trim()) {
        alert('Te rog introdu numărul de telefon');
        return;
      }
      
      if (!this.formData.startDate) {
        alert('Te rog selectează data de început');
        return;
      }
      
      if (!this.formData.endDate) {
        alert('Te rog selectează data de sfârșit');
        return;
      }
      
      if (new Date(this.formData.startDate) >= new Date(this.formData.endDate)) {
        alert('Data de sfârșit trebuie să fie după data de început');
        return;
      }
      
      this.$emit('submit', { ...this.formData })
      this.closeModal()
    },
    
    resetForm() {
      this.formData = {
        carRegistration: '',
        customerName: '',
        phone: '',
        startDate: '',
        endDate: ''
      }
    }
  }
}
</script> 
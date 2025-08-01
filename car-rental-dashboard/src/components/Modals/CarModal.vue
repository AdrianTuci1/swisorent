<template>
  <div v-if="show" :class="styles.modalOverlay" @click="closeModal">
    <div :class="styles.modal" @click.stop>
      <div :class="styles.modalHeader">
        <h3 :class="styles.modalTitle">{{ editingCar ? 'Editează Mașină' : 'Adaugă Mașină' }}</h3>
        <button @click="closeModal" :class="styles.closeBtn">×</button>
      </div>
      
      <form @submit.prevent="submitForm" :class="styles.modalForm">
        <div :class="styles.formGroup">
          <label for="registrationNumber" :class="styles.formLabel">Număr Matriculare:</label>
          <input 
            type="text" 
            id="registrationNumber" 
            v-model="formData.registrationNumber" 
            required
            :disabled="editingCar"
            :class="styles.formInput"
          >
        </div>
        
        <div :class="styles.formGroup">
          <label for="model" :class="styles.formLabel">Model:</label>
          <input type="text" id="model" v-model="formData.model" required :class="styles.formInput">
        </div>
        
        <div :class="styles.formGroup">
          <label for="color" :class="styles.formLabel">Culoare:</label>
          <input type="text" id="color" v-model="formData.color" required :class="styles.formInput">
        </div>
        
        <div :class="styles.formGroup">
          <label for="carPrice" :class="styles.formLabel">Preț (RON/zi):</label>
          <input type="number" id="carPrice" v-model="formData.price" required min="0" :class="styles.formInput">
        </div>
        
        <div :class="styles.modalActions">
          <button type="button" @click="closeModal" :class="styles.cancelBtn">Anulează</button>
          <button type="submit" :class="styles.submitBtn">
            {{ editingCar ? 'Actualizează' : 'Adaugă' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import styles from './Modal.module.css'

export default {
  name: 'CarModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    editingCar: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      styles,
      formData: {
        registrationNumber: '',
        model: '',
        color: '',
        price: 0
      }
    }
  },
  watch: {
    editingCar: {
      handler(newCar) {
        if (newCar) {
          this.formData = { ...newCar }
        } else {
          this.resetForm()
        }
      },
      immediate: true
    }
  },
  methods: {
    closeModal() {
      this.$emit('close')
      this.resetForm()
    },
    
    submitForm() {
      // Validate form data
      if (!this.formData.registrationNumber.trim()) {
        alert('Te rog introdu numărul de înmatriculare');
        return;
      }
      
      if (!this.formData.model.trim()) {
        alert('Te rog introdu modelul mașinii');
        return;
      }
      
      if (!this.formData.color.trim()) {
        alert('Te rog introdu culoarea mașinii');
        return;
      }
      
      if (!this.formData.price || this.formData.price <= 0) {
        alert('Te rog introdu un preț valid');
        return;
      }
      
      this.$emit('submit', { ...this.formData })
      this.closeModal()
    },
    
    resetForm() {
      this.formData = {
        registrationNumber: '',
        model: '',
        color: '',
        price: 0
      }
    }
  }
}
</script> 
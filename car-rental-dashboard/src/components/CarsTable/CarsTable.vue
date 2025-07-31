<template>
  <div :class="styles.carsContainer">
    <div :class="styles.carsHeader">
      <h2 :class="styles.carsTitle">Gestionare Mașini</h2>
      <button @click="showAddModal" :class="styles.addBtn">
        + Adaugă Mașină
      </button>
    </div>
    
    <div :class="styles.tableWrapper">
      <table :class="styles.carsTable">
        <thead>
          <tr>
            <th>Număr Matriculare</th>
            <th>Model</th>
            <th>Culoare</th>
            <th>Preț (RON/zi)</th>
            <th>Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="car in cars" :key="car.registrationNumber">
            <td>{{ car.registrationNumber }}</td>
            <td>{{ car.model }}</td>
            <td>
              <span 
                :class="styles.colorIndicator" 
                :style="{ backgroundColor: car.color }"
              ></span>
              {{ car.color }}
            </td>
            <td>{{ car.price }} RON</td>
            <td>
              <button @click="editCar(car)" :class="styles.editBtn">Editează</button>
              <button @click="deleteCar(car.registrationNumber)" :class="styles.deleteBtn">Șterge</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import styles from './CarsTable.module.css'

export default {
  name: 'CarsTable',
  props: {
    cars: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      styles
    }
  },
  methods: {
    showAddModal() {
      this.$emit('show-add-modal')
    },
    
    editCar(car) {
      this.$emit('edit-car', car)
    },
    
    deleteCar(registrationNumber) {
      this.$emit('delete-car', registrationNumber)
    }
  }
}
</script> 
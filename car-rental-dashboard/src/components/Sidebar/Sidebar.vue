<template>
  <aside :class="[styles.sidebar, { [styles.sidebarCollapsed]: isCollapsed }]">
    <div :class="styles.sidebarHeader">
      <h3 v-if="!isCollapsed" :class="styles.sidebarTitle">Dashboard</h3>
      <button @click="toggleSidebar" :class="styles.toggleBtn">
        <i :class="styles.icon">{{ isCollapsed ? ICONS.ARROW_RIGHT : ICONS.ARROW_LEFT }}</i>
      </button>
    </div>
    
    <nav :class="styles.sidebarNav">
      <ul :class="styles.navList">
        <li :class="styles.navItem">
          <button 
            @click="setActiveView('timeline')" 
            :class="[styles.navLink, { [styles.navLinkActive]: activeView === 'timeline' }]"
          >
            <i :class="styles.icon">{{ ICONS.CALENDAR }}</i>
            <span v-if="!isCollapsed">Timeline Rezervări</span>
          </button>
        </li>
        <li :class="styles.navItem">
          <button 
            @click="setActiveView('cars')" 
            :class="[styles.navLink, { [styles.navLinkActive]: activeView === 'cars' }]"
          >
            <i :class="styles.icon">{{ ICONS.CAR }}</i>
            <span v-if="!isCollapsed">Gestionare Mașini</span>
          </button>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script>
import styles from './Sidebar.module.css'
import { ICONS } from '../../utils/icons.js'

export default {
  name: 'Sidebar',
  data() {
    return {
      styles,
      ICONS,
      isCollapsed: false,
      activeView: 'timeline'
    }
  },
  methods: {
    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed
      this.$emit('sidebar-toggle', this.isCollapsed)
    },
    setActiveView(view) {
      this.activeView = view
      this.$emit('view-changed', view)
    }
  }
}
</script> 
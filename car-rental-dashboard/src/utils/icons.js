// Icon utility functions and constants
export const ICONS = {
  CALENDAR: '📅',
  CAR: '🚗',
  ADD: '➕',
  EDIT: '✏️',
  DELETE: '🗑️',
  CLOSE: '×',
  ARROW_LEFT: '←',
  ARROW_RIGHT: '→',
  DASHBOARD: '📊',
  SETTINGS: '⚙️',
  USER: '👤',
  SEARCH: '🔍',
  FILTER: '🔧',
  EXPORT: '📤',
  IMPORT: '📥',
  SAVE: '💾',
  CANCEL: '❌',
  CHECK: '✅',
  WARNING: '⚠️',
  INFO: 'ℹ️'
}

export const getIcon = (iconName) => {
  return ICONS[iconName] || '📋'
}

export const getRandomColor = () => {
  const colors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', 
    '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd',
    '#00d2d3', '#ff9f43', '#10ac84', '#ee5a24'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
} 
export class TimelineDrag {
  constructor(container, options = {}) {
    this.container = container
    this.options = {
      onScroll: null,
      onDragStart: null,
      onDragEnd: null,
      cssClasses: {
        timelineTable: 'timelineTable',
        reservationItem: 'reservationItem'
      },
      ...options
    }
    
    this.isDragging = false
    this.dragStartX = 0
    this.dragStartY = 0
    this.lastDragX = 0
    this.lastDragY = 0
    
    this.init()
  }
  
  init() {
    this.container.addEventListener('mousedown', this.startDrag.bind(this))
    this.container.addEventListener('wheel', this.onWheel.bind(this))
  }
  
  startDrag(e) {
    // Don't start drag on interactive elements
    if (e.target.closest('button') || 
        e.target.closest('input') || 
        e.target.closest('select')) {
      return
    }
    
    // Only start drag if content is scrollable
    if (!this.isScrollable()) return
    
    this.isDragging = true
    this.dragStartX = e.clientX
    this.dragStartY = e.clientY
    
    // Get current scroll position from container
    this.lastDragX = this.container.scrollLeft
    this.lastDragY = this.container.scrollTop
    
    // Prevent text selection during drag
    e.preventDefault()
    e.stopPropagation()
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'grabbing'
    
    // Add global event listeners
    document.addEventListener('mousemove', this.onDrag.bind(this))
    document.addEventListener('mouseup', this.stopDrag.bind(this))
    
    if (this.options.onDragStart) {
      this.options.onDragStart()
    }
  }
  
  onDrag(e) {
    if (!this.isDragging) return
    
    e.preventDefault()
    e.stopPropagation()
    
    const deltaX = e.clientX - this.dragStartX
    const deltaY = e.clientY - this.dragStartY
    
    // Calculate new scroll position - ORIGINAL direction
    const newScrollLeft = this.lastDragX - deltaX
    const newScrollTop = this.lastDragY - deltaY
    
    // Get container and table dimensions
    const table = this.container.querySelector(`.${this.options.cssClasses.timelineTable}`)
    
    if (!table) return
    
    const tableWidth = table.scrollWidth
    const containerWidth = this.container.clientWidth
    const tableHeight = table.scrollHeight
    const containerHeight = this.container.clientHeight
    
    // Calculate scroll limits
    const maxScrollX = Math.max(0, tableWidth - containerWidth)
    const maxScrollY = Math.max(0, tableHeight - containerHeight)
    
    // Apply scroll limits and set scroll position on container
    const finalScrollLeft = Math.max(0, Math.min(maxScrollX, newScrollLeft))
    const finalScrollTop = Math.max(0, Math.min(maxScrollY, newScrollTop))
    
    this.container.scrollLeft = finalScrollLeft
    this.container.scrollTop = finalScrollTop
    
    if (this.options.onScroll) {
      this.options.onScroll(finalScrollLeft, finalScrollTop)
    }
  }
  
  stopDrag() {
    if (!this.isDragging) return
    
    this.isDragging = false
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
    
    // Remove global event listeners
    document.removeEventListener('mousemove', this.onDrag.bind(this))
    document.removeEventListener('mouseup', this.stopDrag.bind(this))
    
    if (this.options.onDragEnd) {
      this.options.onDragEnd()
    }
  }
  
  onWheel(e) {
    e.preventDefault()
    
    const table = this.container.querySelector(`.${this.options.cssClasses.timelineTable}`)
    
    if (!table) return
    
    const tableWidth = table.scrollWidth
    const containerWidth = this.container.clientWidth
    const tableHeight = table.scrollHeight
    const containerHeight = this.container.clientHeight
    
    // Calculate scroll limits
    const maxScrollX = Math.max(0, tableWidth - containerWidth)
    const maxScrollY = Math.max(0, tableHeight - containerHeight)
    
    // Get current scroll position
    let newScrollLeft = this.container.scrollLeft
    let newScrollTop = this.container.scrollTop
    
    // Horizontal scroll with wheel
    if (e.shiftKey) {
      newScrollLeft += e.deltaY
    } else {
      // Vertical scroll
      newScrollTop += e.deltaY
    }
    
    // Apply limits
    newScrollLeft = Math.max(0, Math.min(maxScrollX, newScrollLeft))
    newScrollTop = Math.max(0, Math.min(maxScrollY, newScrollTop))
    
    // Set scroll position on container
    this.container.scrollLeft = newScrollLeft
    this.container.scrollTop = newScrollTop
    
    if (this.options.onScroll) {
      this.options.onScroll(newScrollLeft, newScrollTop)
    }
  }
  
  isScrollable() {
    const table = this.container.querySelector(`.${this.options.cssClasses.timelineTable}`)
    if (!table) return false
    
    const tableWidth = table.scrollWidth
    const containerWidth = this.container.clientWidth
    const tableHeight = table.scrollHeight
    const containerHeight = this.container.clientHeight
    
    return tableWidth > containerWidth || tableHeight > containerHeight
  }
  
  destroy() {
    this.container.removeEventListener('mousedown', this.startDrag.bind(this))
    this.container.removeEventListener('wheel', this.onWheel.bind(this))
    document.removeEventListener('mousemove', this.onDrag.bind(this))
    document.removeEventListener('mouseup', this.stopDrag.bind(this))
  }
} 
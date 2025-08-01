export class ClickDragDetector {
  constructor(options = {}) {
    this.options = {
      dragThreshold: 5, // pixels
      clickDuration: 200, // milliseconds
      ...options
    }
    
    this.mouseDownTime = null
    this.mouseDownPos = null
    this.hasMoved = false
    this.boundMouseMove = null
    this.boundMouseUp = null
  }
  
  startTracking(event) {
    this.mouseDownTime = Date.now()
    this.mouseDownPos = { x: event.clientX, y: event.clientY }
    this.hasMoved = false
    
    // Store bound methods to avoid binding issues
    this.boundMouseMove = this.onMouseMove.bind(this)
    this.boundMouseUp = this.onMouseUp.bind(this)
    
    // Add global listeners
    document.addEventListener('mousemove', this.boundMouseMove)
    document.addEventListener('mouseup', this.boundMouseUp)
  }
  
  onMouseMove(event) {
    if (!this.mouseDownPos) return
    
    const deltaX = Math.abs(event.clientX - this.mouseDownPos.x)
    const deltaY = Math.abs(event.clientY - this.mouseDownPos.y)
    
    // If mouse moved more than threshold, consider it a drag
    if (deltaX > this.options.dragThreshold || deltaY > this.options.dragThreshold) {
      this.hasMoved = true
    }
  }
  
  onMouseUp(event) {
    // Remove global listeners
    if (this.boundMouseMove) {
      document.removeEventListener('mousemove', this.boundMouseMove)
    }
    if (this.boundMouseUp) {
      document.removeEventListener('mouseup', this.boundMouseUp)
    }
    
    // Reset after a short delay
    setTimeout(() => {
      this.mouseDownTime = null
      this.mouseDownPos = null
      this.hasMoved = false
    }, 50)
  }
  
  isClick() {
    if (!this.mouseDownTime) return false
    
    const clickDuration = Date.now() - this.mouseDownTime
    return clickDuration < this.options.clickDuration && !this.hasMoved
  }
  
  isDrag() {
    return this.hasMoved
  }
  
  destroy() {
    // Clean up global event listeners
    if (this.boundMouseMove) {
      document.removeEventListener('mousemove', this.boundMouseMove)
    }
    if (this.boundMouseUp) {
      document.removeEventListener('mouseup', this.boundMouseUp)
    }
  }
} 
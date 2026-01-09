<template>
  <section class="page page-board-edit">
    <div class="editor card">
      <header class="editor-header">
        <h1>Design your mooodboard</h1>
        <p class="small-muted">
         Crée un moodboard personnalisé avec les contenus de ton choix.
        </p>
      </header>

      <div class="form-section">
        <div class="form-group">
          <label for="board-title">Titre de votre moodboard</label>
          <input
            id="board-title"
            v-model="title"
            type="text"
            placeholder="Ex: Mon voyage en Thaïlande"
            class="form-input"
          />
        </div>
        <div class="form-group">
          <label for="board-description">Description</label>
          <textarea
            id="board-description"
            v-model="description"
            placeholder="Décrivez votre moodboard..."
            class="form-textarea"
            rows="3"
          ></textarea>
        </div>
      </div>

      <div class="editor-body">
        <div class="canvas-wrapper">
          <div class="canvas-toolbar">
            <button type="button" class="icon-btn" @click="reset" title="Clear all">
              ×
            </button>
            <button type="button" class="icon-btn" @click="saveBoard" title="Save board">
              💾
            </button>
          </div>

          <div class="canvas" ref="canvas">
            <div
              v-for="el in elements"
              :key="el.id"
              class="canvas-el"
              :class="[el.type, { selected: selectedElement === el.id }]"
              :style="styleFor(el)"
              @mousedown="startDrag(el, $event)"
            >
              <span class="label">
                {{ el.type.toUpperCase() }} • z={{ el.z }}
              </span>
            </div>
          </div>
        </div>

        <div class="toolbar">
          <button type="button" class="tool-btn" @click="add('text')">
            <span class="icon">T</span>
            <span>Text</span>
          </button>
          <button type="button" class="tool-btn" @click="add('image')">
            <span class="icon">🖼</span>
            <span>Image</span>
          </button>
          <button type="button" class="tool-btn" @click="add('audio')">
            <span class="icon">🔊</span>
            <span>Audio</span>
          </button>
          <button type="button" class="tool-btn" @click="add('video')">
            <span class="icon">▶</span>
            <span>Video</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref(null)
const elements = ref([])
const selectedElement = ref(null)
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const title = ref('')
const description = ref('')

function add(type) {
  const maxZ = elements.value.length ? Math.max(...elements.value.map(e => e.z)) : 0
  const z = maxZ + 1
  const rect = canvas.value?.getBoundingClientRect()
  const width = rect?.width || 480
  const height = rect?.height || 320
  const x = 40 + Math.random() * (width - 160)
  const y = 40 + Math.random() * (height - 160)

  elements.value.push({
    id: `${type}-${Date.now()}-${z}`,
    type,
    z,
    x,
    y,
  })
}

function reset() {
  if (!confirm('Clear all elements?')) return
  title.value = ''
  description.value = ''
  elements.value = []
  selectedElement.value = null
  localStorage.removeItem('moood_board_draft')
}

function saveBoard() {
  // Créer un canvas temporaire pour capturer la visualisation
  const tempCanvas = document.createElement('canvas')
  const ctx = tempCanvas.getContext('2d')
  
  // Dimensions du canvas (même taille que le canvas visible)
  const canvasEl = canvas.value
  const rect = canvasEl?.getBoundingClientRect()
  tempCanvas.width = rect?.width || 520
  tempCanvas.height = rect?.height || 280
  
  // Fond du canvas
  ctx.fillStyle = '#e5e7eb'
  ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)
  
  // Dessiner chaque élément sur le canvas temporaire
  elements.value.forEach(el => {
    ctx.save()
    
    // Position et taille de l'élément
    const elWidth = 140
    const elHeight = 90
    
    // Dessiner un rectangle coloré selon le type
    const colors = {
      text: '#a78bfa',
      image: '#60a5fa',
      audio: '#f472b6',
      video: '#34d399'
    }
    ctx.fillStyle = colors[el.type] || '#9ca3af'
    ctx.fillRect(el.x, el.y, elWidth, elHeight)
    
    // Bordure
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.strokeRect(el.x, el.y, elWidth, elHeight)
    
    // Texte du type
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 12px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(el.type.toUpperCase(), el.x + elWidth / 2, el.y + elHeight / 2)
    
    ctx.restore()
  })
  
  // Convertir le canvas en image base64
  const thumbnail = tempCanvas.toDataURL('image/png')
  
  const boardData = {
    title: title.value,
    description: description.value,
    elements: elements.value,
    thumbnail: thumbnail,
    savedAt: new Date().toISOString()
  }
  localStorage.setItem('moood_board_draft', JSON.stringify(boardData))
  
  // Confirmation visuelle
  alert('Board saved successfully!')
}

function loadBoard() {
  const saved = localStorage.getItem('moood_board_draft')
  if (saved) {
    try {
      const boardData = JSON.parse(saved)
      title.value = boardData.title || ''
      description.value = boardData.description || ''
      elements.value = boardData.elements || []
    } catch (err) {
      console.error('Failed to load board:', err)
    }
  }
}

function styleFor(el) {
  return {
    left: `${el.x}px`,
    top: `${el.y}px`,
    zIndex: el.z,
  }
}

function startDrag(el, event) {
  event.preventDefault()
  selectedElement.value = el.id
  isDragging.value = true
  
  const rect = canvas.value.getBoundingClientRect()
  dragOffset.value = {
    x: event.clientX - rect.left - el.x,
    y: event.clientY - rect.top - el.y
  }
}

function onMouseMove(event) {
  if (!isDragging.value || !selectedElement.value) return
  
  const rect = canvas.value.getBoundingClientRect()
  const element = elements.value.find(e => e.id === selectedElement.value)
  
  if (element) {
    let newX = event.clientX - rect.left - dragOffset.value.x
    let newY = event.clientY - rect.top - dragOffset.value.y
    
    // Contraintes pour rester dans le canvas
    const elWidth = 140
    const elHeight = 90
    newX = Math.max(0, Math.min(newX, rect.width - elWidth))
    newY = Math.max(0, Math.min(newY, rect.height - elHeight))
    
    element.x = newX
    element.y = newY
  }
}

function onMouseUp() {
  isDragging.value = false
}

// --- Détection de shake mobile (accéléromètre) ---
let lastShake = 0
const SHAKE_THRESHOLD = 15
const SHAKE_COOLDOWN = 1000 // ms entre deux shakes

function randomizeElements() {
  const rect = canvas.value?.getBoundingClientRect()
  if (!rect || elements.value.length === 0) return
  
  const canvasWidth = rect.width
  const canvasHeight = rect.height
  const elWidth = 140
  const elHeight = 90
  
  // Mélanger aléatoirement les positions de tous les éléments
  elements.value.forEach(el => {
    el.x = Math.random() * (canvasWidth - elWidth)
    el.y = Math.random() * (canvasHeight - elHeight)
  })
  
  // Feedback visuel (optionnel)
  console.log('🎲 Elements randomized!')
}

function handleDeviceMotion(event) {
  const acceleration = event.accelerationIncludingGravity
  if (!acceleration) return
  
  const { x, y, z } = acceleration
  const totalAcceleration = Math.sqrt(x * x + y * y + z * z)
  
  // Détecter un mouvement brusque (shake)
  const now = Date.now()
  if (totalAcceleration > SHAKE_THRESHOLD && now - lastShake > SHAKE_COOLDOWN) {
    lastShake = now
    randomizeElements()
  }
}

onMounted(() => {
  loadBoard()
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
  
  // Activer la détection de shake sur mobile
  if (window.DeviceMotionEvent) {
    window.addEventListener('devicemotion', handleDeviceMotion)
  }
})

onUnmounted(() => {
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
  
  // Nettoyer l'écouteur de shake
  if (window.DeviceMotionEvent) {
    window.removeEventListener('devicemotion', handleDeviceMotion)
  }
})
</script>

<style scoped>
.page {
  padding: 24px 16px;
  display: flex;
  justify-content: center;
}

.editor {
  width: 100%;
  max-width: 980px;
  padding: 24px 24px 28px;
}

.editor-header h1 {
  margin: 0 0 6px;
  font-size: 80px;
  font-weight: 100;
}

.editor-body {
  margin-top: 16px;
}

.canvas-wrapper {
  position: relative;
  border-radius: 18px;
  border: 1px solid #e5e7eb;
  background: #f5f5f8;
  padding: 24px;
}

.canvas-toolbar {
  position: absolute;
  top: 12px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 10;
}

.icon-btn {
  border-radius: 999px;
  border: 1px solid #d4d4d8;
  background: #fff;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
}

.canvas {
  position: relative;
  margin: 0 auto;
  max-width: 520px;
  height: 280px;
  background: #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.canvas-el {
  position: absolute;
  width: 140px;
  height: 90px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #111827;
  font-size: 12px;
  cursor: move;
  user-select: none;
  transition: box-shadow 0.2s ease;
}

.canvas-el:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.canvas-el.selected {
  box-shadow: 0 0 0 3px #3b82f6;
  outline: none;
}

.canvas-el.text {
  background: #fef9c3;
}

.canvas-el.image {
  background: #bfdbfe;
}

.canvas-el.audio {
  background: #ddd6fe;
}

.canvas-el.video {
  background: #fecaca;
}

.label {
  padding: 4px 8px;
}

.form-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.form-group {
  margin-bottom: 12px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
  color: #374151;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d4d4d8;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.toolbar {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 16px;
}

.tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px 8px;
  border-radius: 999px;
  border: 1px solid #d4d4d8;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
}

.tool-btn .icon {
  font-weight: 600;
}

@media (max-width: 768px) {
  .editor {
    padding: 16px;
  }

  .editor-header h1 {
    font-size: 52px;    line-height: 1.2;  }

  .canvas-wrapper {
    padding: 16px;
  }

  .canvas {
    height: 280px;
  }

  .canvas-toolbar {
    top: 16px;
    right: 16px;
    gap: 8px;
  }

  .icon-btn {
    width: 36px;
    height: 36px;
    font-size: 18px;
    border-width: 2px;
  }

  .toolbar {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>

<template>
  <div class="app-layout">
    <input ref="fileInput" type="file" accept="image/*" style="display: none" @change="onFileSelected" />

    <header class="top-bar" :class="{ hidden: !showTopBar }">
      <div class="header-content">
        <div class="input-group">
          <input v-model="title" class="input-title" type="text" placeholder="Nom du moodboard" />
          <input v-model="description" class="input-desc" type="text" placeholder="Ajouter une courte description..." />
        </div>

        <div class="header-actions">
          <button class="back-btn" @click="goBack" title="Retour">← Retour</button>
          <button class="icon-btn" @click="reset" title="Tout effacer">×</button>
          <button class="icon-btn save-btn" @click="saveBoard" title="Sauvegarder">💾</button>
          <button class="icon-btn publish-btn" @click="publishBoard" title="Publier">🚀</button>
        </div>
      </div>
    </header>

    <button
      class="floating-toggle"
      :title="showTopBar ? 'Masquer les options' : 'Afficher les options'"
      @click="showTopBar = !showTopBar"
    >
      {{ showTopBar ? '▲' : '▼' }}
    </button>

    <main class="main-stage">
      <div class="canvas-wrapper">
        <div class="canvas-container">
          <div class="canvas-artboard" ref="canvas" @click="deselect">
            <div v-if="elements.length === 0" class="empty-hint">
              <p>Zone 9:16</p>
              <small>Ajoutez des éléments ci-dessous</small>
            </div>

            <div
              v-for="el in elements"
              :key="el.id"
              class="board-item"
              :class="[el.type, { selected: selectedElement === el.id, editing: editingId === el.id }]"
              :style="styleFor(el)"
              @mousedown.prevent="startDrag(el, $event)"
              @touchstart.prevent="startDrag(el, $event)"
              @click.stop="selectElement(el)"
              @dblclick="el.type === 'text' ? startEdit(el, $event) : null"
            >
              <template v-if="el.type === 'text'">
                <div v-if="editingId === el.id" class="text-editor">
                  <textarea
                    class="text-input"
                    :value="el.content"
                    @input="updateText(el, $event.target.value)"
                    @blur="finishEdit(el)"
                    @keydown.enter.prevent="finishEdit(el)"
                    autofocus
                  ></textarea>
                </div>
                <div v-else class="text-content">
                  {{ el.content || 'Cliquez pour éditer' }}
                </div>
              </template>

              <template v-else>
                <div v-if="el.src" class="image-frame">
                  <img class="image-content" :src="el.src" :alt="el.content || 'Image'" />
                </div>
                <div v-else class="image-placeholder" @click.stop="promptImage(el)">
                  <span>Ajouter une image</span>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="bottom-toolbar">
      <div class="tools-grid">
        <button class="tool-btn" @click="add('text')">
          <span class="icon">T</span>
          <span class="label">Texte</span>
        </button>
        <button class="tool-btn" @click="add('image')">
          <span class="icon">🖼</span>
          <span class="label">Image</span>
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup>
import api from '@/services/api'
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const canvas = ref(null)
const fileInput = ref(null)
const pendingImageId = ref(null)
const elements = ref([])
const selectedElement = ref(null)
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const title = ref('')
const description = ref('')
const showTopBar = ref(true)
const editingId = ref(null)
const lastShakeTs = ref(0)
const shakeThreshold = 18
const passiveTouchOptions = { passive: false }

function draftKey() {
  return route.params.id ? `board-draft-${route.params.id}` : 'board-draft-new'
}

function add(type) {
  const rect = canvas.value?.getBoundingClientRect()
  const boardW = rect?.width || 360
  const boardH = rect?.height || 640

  const w = boardW * 0.42
  const h = type === 'text' ? 64 : w * 0.6

  const maxZ = elements.value.length ? Math.max(...elements.value.map(e => e.z)) : 0

  const newElement = {
    id: `${type}-${Date.now()}`,
    type,
    z: maxZ + 1,
    x: boardW / 2 - w / 2 + (Math.random() * 20 - 10),
    y: boardH / 2 - h / 2 + (Math.random() * 20 - 10),
    w,
    h,
    content: type === 'text' ? 'Cliquez pour éditer' : '',
    src: ''
  }

  elements.value = [...elements.value, newElement]

  if (type === 'text') {
    editingId.value = newElement.id
  } else if (type === 'image') {
    promptImage(newElement)
  }
}

function promptImage(el) {
  pendingImageId.value = el.id
  fileInput.value?.click()
}

function onFileSelected(event) {
  const file = event.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const el = elements.value.find(elem => elem.id === pendingImageId.value)
    if (el) {
      el.src = e.target?.result || ''
    }
    pendingImageId.value = null
  }
  reader.readAsDataURL(file)
  event.target.value = ''
}

function styleFor(el) {
  return {
    transform: `translate(${el.x}px, ${el.y}px)`,
    width: `${el.w}px`,
    height: `${el.h}px`,
    zIndex: el.z
  }
}

function selectElement(el) {
  selectedElement.value = el.id
}

function deselect() {
  selectedElement.value = null
  editingId.value = null
}

function startEdit(el, event) {
  event?.stopPropagation()
  editingId.value = el.id
  selectedElement.value = el.id
}

function finishEdit(el) {
  editingId.value = null
  if (el && typeof el.content === 'string') {
    el.content = el.content.trim()
  }
}

function updateText(el, newContent) {
  el.content = newContent
}

function startDrag(el, event) {
  if (editingId.value || !canvas.value) return
  const clientX = event.touches ? event.touches[0].clientX : event.clientX
  const clientY = event.touches ? event.touches[0].clientY : event.clientY

  const rect = canvas.value.getBoundingClientRect()
  selectedElement.value = el.id
  isDragging.value = true

  dragOffset.value = {
    x: clientX - rect.left - el.x,
    y: clientY - rect.top - el.y
  }
}

function onMouseMove(event) {
  if (!isDragging.value || !selectedElement.value || !canvas.value) return

  const clientX = event.touches ? event.touches[0].clientX : event.clientX
  const clientY = event.touches ? event.touches[0].clientY : event.clientY

  const rect = canvas.value.getBoundingClientRect()
  const el = elements.value.find(e => e.id === selectedElement.value)

  if (!el) return

  let newX = clientX - rect.left - dragOffset.value.x
  let newY = clientY - rect.top - dragOffset.value.y

  newX = Math.max(0, Math.min(newX, rect.width - el.w))
  newY = Math.max(0, Math.min(newY, rect.height - el.h))

  el.x = newX
  el.y = newY
}

function onMouseUp() {
  isDragging.value = false
}

// Randomize positions and z-order within canvas bounds
function randomizeBoard() {
  if (!canvas.value || elements.value.length === 0) return
  const rect = canvas.value.getBoundingClientRect()

  // Fisher–Yates shuffle of z-indexes by swapping z values
  for (let i = elements.value.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const zi = elements.value[i].z
    elements.value[i].z = elements.value[j].z
    elements.value[j].z = zi
  }

  // Random positions, bounded to artboard
  elements.value.forEach(el => {
    const maxX = Math.max(0, rect.width - el.w)
    const maxY = Math.max(0, rect.height - el.h)
    el.x = Math.round(Math.random() * maxX)
    el.y = Math.round(Math.random() * maxY)
  })

  persistDraft()
}

function goBack() {
  const hasContent = title.value || description.value || elements.value.length > 0
  if (hasContent) {
    const confirmed = confirm('Êtes-vous sûr de vouloir quitter sans sauvegarder ?')
    if (confirmed) router.back()
  } else {
    router.back()
  }
}

function reset() {
  if (confirm('Tout effacer ?')) {
    elements.value = []
    title.value = ''
    description.value = ''
    editingId.value = null
    selectedElement.value = null
    localStorage.removeItem(draftKey())
  }
}

function persistDraft() {
  const payload = {
    title: title.value,
    description: description.value,
    elements: elements.value
  }
  localStorage.setItem(draftKey(), JSON.stringify(payload))
}

function saveBoard() {
  persistDraft()
  alert('Brouillon sauvegardé localement')
}

async function publishBoard() {
  if (!title.value) {
    alert('Veuillez entrer un titre avant de publier')
    return
  }

  try {
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = 360
    tempCanvas.height = 640
    const ctx = tempCanvas.getContext('2d')

    ctx.fillStyle = '#e5e7eb'
    ctx.fillRect(0, 0, 360, 640)

    const imagePromises = elements.value
      .filter(el => el.type === 'image' && el.src)
      .map(el => new Promise(resolve => {
        const img = new Image()
        img.onload = () => {
          el._loadedImage = img
          resolve()
        }
        img.onerror = () => resolve()
        img.src = el.src
      }))

    await Promise.all(imagePromises)

    for (const el of elements.value) {
      if (el.type === 'text') {
        ctx.fillStyle = '#111'
        ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        const text = el.content || 'Cliquez pour éditer'
        const maxWidth = el.w - 8
        const words = text.split(' ')
        let line = ''
        let y = el.y + el.h / 2 - 7

        words.forEach(word => {
          const testLine = `${line}${word} `
          const metrics = ctx.measureText(testLine)
          if (metrics.width > maxWidth && line) {
            ctx.fillText(line.trim(), el.x + el.w / 2, y)
            line = `${word} `
            y += 14
          } else {
            line = testLine
          }
        })
        if (line.trim()) {
          ctx.fillText(line.trim(), el.x + el.w / 2, y)
        }
      } else if (el.type === 'image') {
        if (el._loadedImage) {
          ctx.drawImage(el._loadedImage, el.x, el.y, el.w, el.h)
        } else {
          ctx.fillStyle = '#1e40af'
          ctx.font = '12px -apple-system'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('Image', el.x + el.w / 2, el.y + el.h / 2)
        }
      }
    }

    const imageUrl = tempCanvas.toDataURL('image/png')

    await api.boards.create({
      title: title.value,
      description: description.value,
      imageUrl,
      isPublic: true
    })

    localStorage.removeItem(draftKey())
    alert('Moodboard publié !')
    router.back()
  } catch (e) {
    console.error('Publication failed:', e)
    alert('Échec de la publication. Veuillez réessayer.')
  }
}

async function loadBoard() {
  const draft = localStorage.getItem(draftKey())
  if (draft) {
    try {
      const parsed = JSON.parse(draft)
      title.value = parsed.title || ''
      description.value = parsed.description || ''
      elements.value = Array.isArray(parsed.elements) ? parsed.elements : []
      return
    } catch (e) {
      console.warn('Impossible de restaurer le brouillon', e)
    }
  }

  const id = route.params.id
  if (!id) return

  try {
    const res = await api.boards.get(id)
    const board = res.data || {}
    title.value = board.title || ''
    description.value = board.description || ''

    if (Array.isArray(board.elements) && board.elements.length) {
      elements.value = board.elements.map((el, idx) => ({
        id: el.id || el._id || `el-${idx}`,
        type: el.type || 'text',
        x: el.x ?? 20,
        y: el.y ?? 20,
        w: el.w ?? 180,
        h: el.h ?? (el.type === 'text' ? 60 : 180),
        z: el.z ?? idx + 1,
        content: el.content || el.text || '',
        src: el.src || el.imageUrl || ''
      }))
    } else if (board.imageUrl) {
      elements.value = [{
        id: 'image-from-board',
        type: 'image',
        x: 20,
        y: 20,
        w: 320,
        h: 440,
        z: 1,
        content: '',
        src: board.imageUrl
      }]
    }
  } catch (err) {
    console.error('Board load failed:', err)
  }
}

function handleDeviceMotion(event) {
  const acc = event.accelerationIncludingGravity || {}
  const x = acc.x || 0
  const y = acc.y || 0
  const z = acc.z || 0
  const magnitude = Math.sqrt(x * x + y * y + z * z)
  const now = Date.now()

  if (magnitude > shakeThreshold && now - lastShakeTs.value > 1200) {
    lastShakeTs.value = now
    // Secousse détectée : on mélange le layout
    randomizeBoard()
  }
}

onMounted(() => {
  loadBoard()
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
  document.addEventListener('touchmove', onMouseMove, passiveTouchOptions)
  document.addEventListener('touchend', onMouseUp)

  if (window.DeviceMotionEvent) {
    window.addEventListener('devicemotion', handleDeviceMotion)
  }
})

onUnmounted(() => {
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
  document.removeEventListener('touchmove', onMouseMove, passiveTouchOptions)
  document.removeEventListener('touchend', onMouseUp)

  if (window.DeviceMotionEvent) {
    window.removeEventListener('devicemotion', handleDeviceMotion)
  }
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.app-layout {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  color: #111;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  padding-top: 60px;
  z-index: 1;
}

.top-bar {
  flex: 0 0 auto;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #f3f4f6;
  z-index: 20;
  animation: slideDown 0.3s ease-out;
  max-height: 120px;
  overflow: hidden;
}

.top-bar.hidden {
  max-height: 0;
  padding: 0;
  border: none;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideDown {
  from {
    max-height: 0;
    padding: 0;
    opacity: 0;
  }

  to {
    max-height: 120px;
    padding: 12px 16px;
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    max-height: 120px;
    padding: 12px 16px;
    opacity: 1;
  }

  to {
    max-height: 0;
    padding: 0;
    opacity: 0;
  }
}

.floating-toggle {
  position: fixed;
  top: 72px;
  right: 12px;
  width: 48px;
  height: 48px;
  background: #3b82f6;
  border: none;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s;
  color: white;
  font-weight: bold;
}

.floating-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.floating-toggle:active {
  transform: scale(0.95);
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.input-title {
  font-size: 18px;
  font-weight: 700;
  border: none;
  outline: none;
  width: 100%;
  padding: 0;
  color: #111;
}

.input-title::placeholder {
  color: #111;
  opacity: 1;
}

.input-desc {
  font-size: 13px;
  color: #666;
  border: none;
  outline: none;
  width: 100%;
  padding: 0;
}

.header-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
  flex-wrap: wrap;
}

.back-btn {
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  transition: background 0.2s;
}

.back-btn:hover {
  background: #e5e7eb;
}

.icon-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;
}

.icon-btn:hover {
  background: #e5e7eb;
}

.save-btn {
  background: #f3f4f6;
}

.publish-btn {
  background: #3b82f6;
  color: white;
}

.publish-btn:hover {
  background: #2563eb;
}

.main-stage {
  flex: 1;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  overflow: hidden;
  position: relative;
  min-height: 0;
}

.canvas-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 500px;
}

.canvas-container {
  width: 100%;
  height: auto;
  aspect-ratio: 9 / 16;
  max-height: 100%;
  max-width: 100%;
  background: #e5e7eb;
  position: relative;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  touch-action: none;
}

.canvas-artboard {
  width: 100%;
  height: 100%;
  position: relative;
}

.empty-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #9ca3af;
  pointer-events: none;
}

.board-item {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: grab;
  user-select: none;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
  border: 1px solid #e5e7eb;
  background: #ffffff;
}

.board-item:active {
  cursor: grabbing;
}

.board-item.selected {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
  z-index: 1000 !important;
}

.board-item.text {
  color: #111;
  padding: 8px;
  overflow: hidden;
}

.board-item.text.editing {
  background: #fff7ed;
  border-color: #fbbf24;
}

.text-editor {
  width: 100%;
  height: 100%;
  display: flex;
}

.text-input {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  font-size: 14px;
  font-family: inherit;
  color: #111;
  resize: none;
  padding: 4px;
}

.text-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  word-wrap: break-word;
  white-space: pre-wrap;
  cursor: text;
  padding: 4px;
}

.board-item.image {
  background: #dbeafe;
  color: #1e40af;
  padding: 0;
  overflow: hidden;
}

.image-frame {
  width: 100%;
  height: 100%;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  cursor: pointer;
  font-size: 14px;
  color: #1e40af;
  text-align: center;
  padding: 8px;
}

.image-placeholder:hover {
  background: linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%);
}

.image-content {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

.bottom-toolbar {
  flex: 0 0 auto;
  background: #fff;
  border-top: 1px solid #f3f4f6;
  padding: 12px 16px;
  z-index: 10;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  max-width: 600px;
  margin: 0 auto;
}

.tool-btn {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: transform 0.1s, background 0.1s;
}

.tool-btn:active {
  transform: scale(0.96);
  background: #f9fafb;
}

.tool-btn .icon {
  font-size: 20px;
}

.tool-btn .label {
  font-size: 11px;
  color: #374151;
}

@media (min-width: 768px) {
  .canvas-container {
    border: 8px solid #fff;
    box-shadow: 0 0 0 1px #e5e7eb, 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }
}
</style>
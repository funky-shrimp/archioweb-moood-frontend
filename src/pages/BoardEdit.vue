<template>
  <div class="app-layout">

    <!-- Input fichier caché -->
    <input ref="fileInput" type="file" accept="image/*" style="display: none" @change="onFileSelected" />

    <header class="top-bar" :class="{ 'hidden': !showTopBar }">
      <div class="header-content">
        <div class="input-group">
          <input v-model="title" class="input-title" type="text" placeholder="Nom du moodboard">
          <input v-model="description" class="input-desc" type="text" placeholder="Ajouter une courte description...">
        </div>

        <div class="header-actions">
          <button class="back-btn" @click="goBack" title="Retour">
            ← Retour
          </button>
          <button class="icon-btn" @click="reset" title="Tout effacer">×</button>
          <button class="icon-btn save-btn" @click="saveBoard" title="Sauvegarder">
            💾
          </button>
          <button class="icon-btn publish-btn" @click="publishBoard" title="Publier">
            🚀
          </button>
        </div>
      </div>
    </header>

    <button class="floating-toggle" @click="showTopBar = !showTopBar"
      :title="showTopBar ? 'Masquer les options' : 'Afficher les options'">
      {{ showTopBar ? '▲' : '▼' }}
    </button>

    <main class="main-stage">
      <div class="canvas-wrapper">
        <div class="canvas-container" ref="canvasRef">

          <div class="canvas-artboard" ref="canvas">
            <div v-if="elements.length === 0" class="empty-hint">
              <p>Zone 9:16</p>
              <small>Ajoutez des éléments ci-dessous</small>
            </div>

            <div v-for="el in elements" :key="el.id" class="board-item"
              :class="[el.type, { selected: selectedElement === el.id, editing: editingId === el.id }]"
              :style="styleFor(el)" @mousedown.stop="startDrag(el, $event)" @touchstart.stop="startDrag(el, $event)">
              <!-- Élément texte éditable -->
              <template v-if="el.type === 'text'">
                <div v-if="editingId === el.id" class="text-editor" @click.stop>
                  <textarea :value="el.content" @input="updateText(el, $event.target.value)" @blur="finishEdit(el)"
                    @keydown.escape="finishEdit(el)" class="text-input" autofocus></textarea>
                </div>
                <div v-else class="text-content" @click.stop="startEdit(el, $event)">
                  {{ el.content || 'Cliquez pour éditer' }}
                </div>
              </template>

              <!-- Élément image -->
              <template v-else-if="el.type === 'image'">
                <div v-if="!el.src" class="image-placeholder" @click.stop="pendingImageId = el.id; fileInput?.click()">
                  <span>📷 Cliquez pour charger</span>
                </div>
                <img v-else :src="el.src" :alt="el.id" class="image-content" />
              </template>

              <!-- Autres types d'éléments -->
              <span v-else class="item-label">{{ el.type }}</span>
            </div>
          </div>

        </div>
      </div>
    </main>

    <footer class="bottom-toolbar">
      <div class="tools-grid">
        <button class="tool-btn" @click="add('text')">
          <span class="icon">T</span>
          <span class="label">Text</span>
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
import html2canvas from 'html2canvas'
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const canvas = ref(null)
const canvasRef = ref(null)
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

// --- Logique d'ajout ---
function add(type) {
  const rect = canvas.value?.getBoundingClientRect()
  const boardW = rect?.width || 360
  const boardH = rect?.height || 640

  const w = boardW * 0.4
  const h = type === 'text' ? 50 : w * 0.6

  const maxZ = elements.value.length ? Math.max(...elements.value.map(e => e.z)) : 0

  const newElement = {
    id: `${type}-${Date.now()}`,
    type,
    z: maxZ + 1,
    x: (boardW / 2) - (w / 2) + (Math.random() * 20 - 10),
    y: (boardH / 2) - (h / 2) + (Math.random() * 20 - 10),
    w,
    h,
    content: type === 'text' ? 'Cliquez pour éditer' : '',
    src: '' // Pour les images
  }

  elements.value.push(newElement)

  // Si c'est du texte, activer l'édition immédiatement
  if (type === 'text') {
    editingId.value = newElement.id
  } else if (type === 'image') {
    // Si c'est une image, déclencher le sélecteur de fichier
    pendingImageId.value = newElement.id
    fileInput.value?.click()
  }
}

// --- Gestion des images ---
function onFileSelected(event) {
  const file = event.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const el = elements.value.find(elem => elem.id === pendingImageId.value)
    if (el) {
      el.src = e.target.result
    }
    pendingImageId.value = null
  }
  reader.readAsDataURL(file)

  // Réinitialiser le input
  event.target.value = ''
}

// --- Style dynamique ---
function styleFor(el) {
  return {
    transform: `translate(${el.x}px, ${el.y}px)`,
    width: `${el.w}px`,
    height: `${el.h}px`,
    zIndex: el.z,
  }
}

// --- Édition de texte ---
function startEdit(el, event) {
  event.stopPropagation()
  editingId.value = el.id
  selectedElement.value = el.id
}

function finishEdit(el) {
  editingId.value = null
}

function updateText(el, newContent) {
  el.content = newContent
}

// --- Drag & Drop (Support Souris + Tactile) ---
function startDrag(el, event) {
  if (editingId.value) return
  if (event.cancelable) event.preventDefault();

  selectedElement.value = el.id
  isDragging.value = true

  const clientX = event.touches ? event.touches[0].clientX : event.clientX
  const clientY = event.touches ? event.touches[0].clientY : event.clientY

  const rect = canvas.value.getBoundingClientRect()

  dragOffset.value = {
    x: clientX - rect.left - el.x,
    y: clientY - rect.top - el.y
  }
}

function onMove(event) {
  if (!isDragging.value || !selectedElement.value) return

  const clientX = event.touches ? event.touches[0].clientX : event.clientX
  const clientY = event.touches ? event.touches[0].clientY : event.clientY

  const rect = canvas.value.getBoundingClientRect()
  const el = elements.value.find(e => e.id === selectedElement.value)

  if (el) {
    let newX = clientX - rect.left - dragOffset.value.x
    let newY = clientY - rect.top - dragOffset.value.y

    newX = Math.max(0, Math.min(newX, rect.width - el.w))
    newY = Math.max(0, Math.min(newY, rect.height - el.h))

    el.x = newX
    el.y = newY
  }
}

function onEnd() {
  isDragging.value = false
}

// --- Actions Globales ---
function goBack() {
  const hasContent = title.value || description.value || elements.value.length > 0

  if (hasContent) {
    const confirmed = confirm('Êtes-vous sûr de vouloir quitter sans sauvegarder ?')
    if (confirmed) {
      router.back()
    }
  } else {
    router.back()
  }
}

function reset() {
  if (confirm("Tout effacer ?")) {
    elements.value = []
    title.value = ""
    description.value = ""
  }
}

function saveBoard() {
  console.log("Saving layout...", {
    title: title.value,
    desc: description.value,
    elements: elements.value
  })
  alert("Sauvegarde effectuée (voir console)")
}

async function publishBoard() {
  if (!title.value) {
    alert("Veuillez entrer un titre avant de publier")
    return
  }

  try {
    // Créer un canvas temporaire pour capturer exactement ce que l'utilisateur voit
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = 360
    tempCanvas.height = 640
    const ctx = tempCanvas.getContext('2d')
    
    // Fond gris
    ctx.fillStyle = '#e5e7eb'
    ctx.fillRect(0, 0, 360, 640)
    
    // Charger toutes les images d'abord
    const imagePromises = elements.value
      .filter(el => el.type === 'image' && el.src)
      .map(el => {
        return new Promise((resolve) => {
          const img = new Image()
          img.onload = () => {
            el._loadedImage = img
            resolve()
          }
          img.onerror = () => resolve()
          img.src = el.src
        })
      })
    
    // Attendre que toutes les images soient chargées
    await Promise.all(imagePromises)
    
    // Maintenant dessiner les éléments
    for (const el of elements.value) {
      // Dessiner le contenu (SANS fond ni bordure)
      if (el.type === 'text') {
        ctx.fillStyle = '#111'
        ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        
        const text = el.content || 'Cliquez pour éditer'
        const maxWidth = el.w - 8
        
        // Wrapper de texte
        const words = text.split(' ')
        let line = ''
        let y = el.y + el.h / 2 - 7
        
        words.forEach(word => {
          const testLine = line + word + ' '
          const metrics = ctx.measureText(testLine)
          if (metrics.width > maxWidth && line) {
            ctx.fillText(line.trim(), el.x + el.w / 2, y)
            line = word + ' '
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
          // Dessiner l'image chargée
          ctx.drawImage(el._loadedImage, el.x, el.y, el.w, el.h)
        } else {
          // Placeholder
          ctx.fillStyle = '#1e40af'
          ctx.font = '12px -apple-system'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('📷', el.x + el.w / 2, el.y + el.h / 2)
        }
      }
    }
    
    const imageUrl = tempCanvas.toDataURL('image/png')
    
    console.log("Publishing board...", {
      title: title.value,
      description: description.value,
      elements: elements.value,
      imageUrl: imageUrl
    })
    
    // Appeler l'API avec l'image
    await api.boards.create({
      title: title.value,
      description: description.value,
      imageUrl: imageUrl,
      isPublic: true,
    })
    
    alert("Moodboard publié !")
    router.back()
  } catch (e) {
    console.error("Publication failed:", e)
    alert("Échec de la publication. Veuillez réessayer.")
  }
}

// --- Lifecycle ---
onMounted(() => {
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onEnd)
  window.addEventListener('touchmove', onMove, { passive: false })
  window.addEventListener('touchend', onEnd)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('mouseup', onEnd)
  window.removeEventListener('touchmove', onMove)
  window.removeEventListener('touchend', onEnd)
})
</script>

<style scoped>
/* RESET & GLOBAL */
* {
  box-sizing: border-box;
}

.app-layout {
  /* Prend tout l'écran, pas de scroll global */
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
  /* Repousser en bas de la navigation */
  z-index: 1;
  /* Important : être au-dessus des autres éléments */
}

/* --- HEADER --- */
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

/* Bouton flottant pour afficher/masquer la top-bar */
.floating-toggle {
  position: fixed;
  top: 72px;
  /* 60px navbar + 12px offset */
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

/* Zone cliquable en haut du canvas pour afficher la top-bar */
.swipe-hint {
  position: absolute;
  top: 70px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(59, 130, 246, 0.9);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  z-index: 24;
  transition: opacity 0.2s;
}

.swipe-hint:hover {
  opacity: 0.8;
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

/* --- MAIN STAGE --- */
.main-stage {
  flex: 1;
  /* Prend tout l'espace restant */
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  overflow: hidden;
  position: relative;
  min-height: 0;
  /* Important pour flex */
}

.canvas-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 500px;
  /* Limite la largeur sur Desktop pour rester élégant */
}

.canvas-container {
  /* MAGIE DU RATIO 9:16 */
  width: 100%;
  height: auto;
  aspect-ratio: 9 / 16;

  /* Contraintes pour ne jamais déborder */
  max-height: 100%;
  max-width: 100%;

  background: #e5e7eb;
  /* Couleur de fond du canvas */
  position: relative;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  /* Optionnel : coins arrondis comme un téléphone */
  overflow: hidden;
}

.canvas-artboard {
  width: 100%;
  height: 100%;
  position: relative;
}

/* --- ELEMENTS --- */
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
  /* Placement via JS style transform */
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
 
  border: 2px solid transparent;
  transition: box-shadow 0.2s;
}

.board-item:active {
  cursor: grabbing;
}

.board-item.selected {
  border-color: #3b82f6;
  z-index: 1000 !important;
}

/* Couleurs des textes */
.board-item.text {
  color: #111;
  padding: 8px;
  overflow: hidden;
}

.board-item.text.editing {
  background: #fff;
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
}

/* --- FOOTER TOOLBAR --- */
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

/* --- RESPONSIVE ADJUSTMENTS --- */
@media (min-width: 768px) {

  /* Sur ordinateur, on simule mieux l'appareil mobile */
  .canvas-container {
    border: 8px solid #fff;
    /* Effet cadre */
    box-shadow: 0 0 0 1px #e5e7eb, 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }
}
</style>
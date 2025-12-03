<template>
  <section class="board-canvas">
    <!-- En-tête : titre + bouton pour réinitialiser la vue (pan/zoom) -->
    <header class="canvas-header">
      <div>
        <h3>Board canvas</h3>
        <p class="small-muted">Clique + glisser pour te déplacer, molette pour zoomer.</p>
      </div>
      <button class="btn reset-btn" type="button" @click="resetView">Réinitialiser</button>
    </header>

    <!-- Zone interactive qui gère le pan/zoom -->
    <div
      class="canvas-stage"
      ref="stage"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointerleave="onPointerUp"
      @pointercancel="onPointerUp"
      @wheel.prevent="onWheel"
    >
      <!-- grille de fond purement décorative -->
      <div class="canvas-grid"></div>

      <!-- Conteneur “virtuel” beaucoup plus grand que la fenêtre visible -->
      <div class="canvas-content" :style="contentStyle" ref="content">
        <!-- Chaque élément du board est projeté ici avec une position / rotation calculée -->
        <div
          v-for="item in laidOutElements"
          :key="item._id || item.__key"
          class="canvas-item"
          :class="[`type-${item.type || 'unknown'}`]"
          :style="item.style"
        >
          <!-- Image pleine si l’élément est de type image -->
          <img v-if="item.type === 'image'" :src="item.src" :alt="item.alt || 'element'" />
          <!-- Sinon, petit bloc de texte avec le type / contenu -->
          <div v-else class="fallback">
            <strong>{{ item.type }}</strong>
            <span>{{ item.text || item.src }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

// Dimensions “logiques” du canevas, indépendantes de la taille réelle de l’écran
const BASE_WIDTH = 1600
const BASE_HEIGHT = 1000

// Props : la liste des éléments d’un board (venant du backend plus tard)
const props = defineProps({
  elements: {
    type: Array,
    default: () => [],
  },
})

// Références DOM et état de transformation (pan/zoom)
const stage = ref(null)
const content = ref(null)
const transform = ref({ x: 0, y: 0, s: 1 }) // x/y = translation, s = scale
const pointer = { active: false, lastX: 0, lastY: 0 }

// Au montage, on centre le grand canevas virtuel dans la fenêtre visible
onMounted(() => {
  const rect = stage.value?.getBoundingClientRect()
  if (!rect) return
  transform.value.x = (rect.width - BASE_WIDTH) / 2
  transform.value.y = (rect.height - BASE_HEIGHT) / 2
})

// Calcule une “mise en page” pseudo-aléatoire mais stable pour chaque élément
// (position dans une grille 3 colonnes + petites variations + rotation légère)
const laidOutElements = computed(() => {
  if (!props.elements || !props.elements.length) {
    return []
  }

  return props.elements.map((el, idx) => {
    const seed = String(el._id ?? idx)
    const col = idx % 3
    const row = Math.floor(idx / 3)

    const width = clamp(220 + rnd(seed + 'w') * 160, 180, 360)
    const height = el.type === 'image' ? width * 0.62 : 140
    const baseX = 140 + col * 420
    const baseY = 120 + row * 260
    const jitterX = rnd(seed + 'jx') * 140 - 70
    const jitterY = rnd(seed + 'jy') * 80 - 40
    const x = clamp(baseX + jitterX, 40, BASE_WIDTH - width - 80)
    const y = clamp(baseY + jitterY, 30, BASE_HEIGHT - height - 60)
    const rotation = rnd(seed + 'rot') * 10 - 5

    return {
      ...el,
      __key: idx,
      style: {
        width: `${width}px`,
        height: `${height}px`,
        left: `${x}px`,
        top: `${y}px`,
        transform: `rotate(${rotation}deg)`,
      },
    }
  })
})

// Style global appliqué au grand canevas (pan/zoom)
const contentStyle = computed(() => ({
  width: `${BASE_WIDTH}px`,
  height: `${BASE_HEIGHT}px`,
  transform: `translate(${transform.value.x}px, ${transform.value.y}px) scale(${transform.value.s})`,
  transformOrigin: '0 0',
}))

// Remet le pan/zoom à l’état initial
function resetView() {
  transform.value = { x: 0, y: 0, s: 1 }
}

// Gestion du drag (pan) avec les événements pointer*
function onPointerDown(event) {
  if (event.button && event.button !== 0) return
  pointer.active = true
  pointer.lastX = event.clientX
  pointer.lastY = event.clientY
  stage.value?.setPointerCapture?.(event.pointerId)
}

function onPointerMove(event) {
  if (!pointer.active) return
  const dx = event.clientX - pointer.lastX
  const dy = event.clientY - pointer.lastY
  transform.value.x += dx
  transform.value.y += dy
  pointer.lastX = event.clientX
  pointer.lastY = event.clientY
}

function onPointerUp(event) {
  if (!pointer.active) return
  pointer.active = false
  stage.value?.releasePointerCapture?.(event.pointerId)
}

// Gestion du zoom à la molette, centré autour du pointeur de la souris
function onWheel(event) {
  const delta = -event.deltaY / 500
  const nextScale = clamp(transform.value.s + delta, 0.35, 2.5)
  const rect = stage.value.getBoundingClientRect()
  const px = event.clientX - rect.left
  const py = event.clientY - rect.top
  const ox = (px - transform.value.x) / transform.value.s
  const oy = (py - transform.value.y) / transform.value.s
  transform.value.s = nextScale
  transform.value.x = px - ox * nextScale
  transform.value.y = py - oy * nextScale
}

// Petit générateur pseudo-aléatoire déterministe basé sur une chaîne (id)
function rnd(seed) {
  let h = 0
  for (let i = 0; i < seed.length; i += 1) {
    h = Math.imul(31, h) + seed.charCodeAt(i)
  }
  return ((h >>> 0) % 1000) / 1000
}

// Contraint une valeur entre un min et un max
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}
</script>

<style scoped>
.board-canvas {
  margin: 24px 0;
}

.canvas-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.canvas-header h3 {
  margin: 0;
}

.canvas-stage {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid #ededf2;
  background: radial-gradient(circle at top, #f8f8fb, #f0f2f7);
  min-height: 520px;
  touch-action: none;
  cursor: grab;
}

.canvas-stage:active {
  cursor: grabbing;
}

.canvas-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(0deg, rgba(50, 60, 90, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(50, 60, 90, 0.04) 1px, transparent 1px);
  background-size: 80px 80px;
  pointer-events: none;
}

.canvas-content {
  position: relative;
  transform-origin: 0 0;
  transition: transform 0.08s linear;
}

.canvas-item {
  position: absolute;
  border-radius: 18px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.15);
  overflow: hidden;
  background: white;
  border: 1px solid rgba(15, 23, 42, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.canvas-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.canvas-item .fallback {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.canvas-item:hover {
  box-shadow: 0 25px 60px rgba(15, 23, 42, 0.25);
  transform: scale(1.02);
}

.reset-btn {
  border-color: var(--muted-border);
}
</style>


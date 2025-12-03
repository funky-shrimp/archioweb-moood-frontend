<template>
  <section class="page page-board-edit">
    <div class="editor card">
      <header class="editor-header">
        <h1>Design your mooodboard</h1>
        <p class="small-muted">
          Les éléments sont empilés avec leur z-index (plus le nombre est grand, plus l’élément est “au-dessus”).
        </p>
      </header>

      <div class="editor-body">
        <div class="canvas-wrapper">
          <div class="canvas-toolbar">
            <button type="button" class="icon-btn" @click="reset">
              ×
            </button>
            <button type="button" class="icon-btn">
              ⎘
            </button>
          </div>

          <div class="canvas" ref="canvas">
            <div
              v-for="el in elements"
              :key="el.id"
              class="canvas-el"
              :class="el.type"
              :style="styleFor(el)"
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
import { ref } from 'vue'

const canvas = ref(null)
const elements = ref([])

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
  elements.value = []
}

function styleFor(el) {
  return {
    left: `${el.x}px`,
    top: `${el.y}px`,
    zIndex: el.z,
  }
}
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
  font-size: 20px;
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
  height: 360px;
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

  .canvas {
    height: 280px;
  }

  .toolbar {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>

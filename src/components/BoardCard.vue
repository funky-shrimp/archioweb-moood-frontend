<template>
  <article class="board-card" :class="{ dragging }" @click="onCardClick" role="button" tabindex="0">
    <div class="board-header">
      <img class="owner-avatar" :src="ownerAvatar" alt="avatar" v-if="board?.owner" />
      <div class="owner-meta">
        <div class="owner-name">{{ board?.owner?.username || 'unknown' }}</div>
        <div class="owner-sub small-muted">{{ boardSubtitle }}</div>
      </div>
      <div class="spacer"></div>
      <FollowButton v-if="showFollow && board?.owner?._id" :userId="board.owner._id" :initialFollowing="board.owner?.viewerIsFollowing" @toggled.stop />
    </div>

    <div class="board-preview">
      <div class="preview-stage" ref="stage" @pointerdown="onPointerDown" @pointermove="onPointerMove" @pointerup="onPointerUp" @pointercancel="onPointerUp" @wheel.prevent="onWheel">
        <div class="preview-content" ref="content" :style="contentStyle">
          <img v-if="firstImage" :src="firstImage" class="preview-image" />
          <div v-else class="preview-placeholder">No preview</div>
        </div>

        <button class="open-btn" @click.stop="open">Open</button>
      </div>
    </div>

    <div class="board-actions" v-if="showActions">
      <button class="icon-btn" @click.stop="toggleLike">
        <span class="heart">♡</span> <span class="count">{{ likesCount }}</span>
      </button>
      <button class="icon-btn" @click.stop="openComments">
        💬 <span class="count">{{ commentsCount }}</span>
      </button>
    </div>
  </article>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import FollowButton from './FollowButton.vue'
import api from '../services/api'

const props = defineProps({
  board: { type: Object, required: true },
  showFollow: { type: Boolean, default: true },
  showActions: { type: Boolean, default: true }
})

const router = useRouter()
const likesCount = ref(props.board.likesCount ?? 0)
const commentsCount = ref(props.board.commentsCount ?? 0)

const firstImage = computed(() => {
  const el = (props.board.elements || []).find(e => e.type === 'image')
  return el?.src || ''
})
const ownerAvatar = computed(() => props.board.owner?.avatar || '/placeholder-avatar.png')
const boardSubtitle = computed(() => (props.board.labels || []).slice(0,3).join(' • '))

function open() {
  if (!props.board?._id) return
  router.push(`/board/${props.board._id}`)
}

async function toggleLike() {
  try {
    const liked = !!props.board.viewerHasLiked
    if (liked) {
      await api.post(`/boards/${props.board._id}/unlike`)
      likesCount.value = Math.max(0, likesCount.value - 1)
      props.board.viewerHasLiked = false
    } else {
      await api.post(`/boards/${props.board._id}/like`)
      likesCount.value = likesCount.value + 1
      props.board.viewerHasLiked = true
    }
  } catch (e) { /* ignore */ }
}

function openComments() { open() }

// --- interactive pan/zoom logic ---
const stage = ref(null)
const content = ref(null)
const transform = ref({ x: 0, y: 0, s: 1 })
let draggingLocal = false
let last = { x: 0, y: 0 }
let moved = false
const dragging = ref(false)

function contentStyle() {
  return {
    transform: `translate(${transform.value.x}px, ${transform.value.y}px) scale(${transform.value.s})`,
  }
}

function onPointerDown(e) {
  // only primary button / touch
  if (e.button && e.button !== 0) return
  draggingLocal = true
  dragging.value = true
  moved = false
  last.x = e.clientX
  last.y = e.clientY
  e.target.setPointerCapture?.(e.pointerId)
}

function onPointerMove(e) {
  if (!draggingLocal) return
  const dx = e.clientX - last.x
  const dy = e.clientY - last.y
  if (Math.abs(dx) > 2 || Math.abs(dy) > 2) moved = true
  transform.value.x += dx
  transform.value.y += dy
  last.x = e.clientX
  last.y = e.clientY
}

function onPointerUp(e) {
  draggingLocal = false
  dragging.value = false
  try { e.target.releasePointerCapture?.(e.pointerId) } catch {}
}

function onWheel(e) {
  const delta = -e.deltaY / 500
  const newS = Math.min(2.5, Math.max(0.4, transform.value.s + delta))
  // zoom around pointer
  const rect = stage.value.getBoundingClientRect()
  const px = e.clientX - rect.left
  const py = e.clientY - rect.top
  const ox = (px - transform.value.x) / transform.value.s
  const oy = (py - transform.value.y) / transform.value.s
  transform.value.s = newS
  transform.value.x = px - ox * newS
  transform.value.y = py - oy * newS
}

// prevent opening the board when user was dragging
function onCardClick() {
  if (moved) { moved = false; return } // consumed drag
  open()
}
</script>

<style scoped>
.board-card { background:#fff; border-radius:12px; padding:14px; border:1px solid #eee; display:flex; flex-direction:column; gap:12px; cursor:default; max-width:980px; margin:0 auto; }
.board-card.dragging { cursor:grabbing }
.board-header { display:flex; align-items:center; gap:12px; }
.owner-avatar { width:36px; height:36px; border-radius:50%; object-fit:cover; border:1px solid #e6e6e6 }
.owner-meta { display:flex; flex-direction:column }
.owner-name { font-weight:600 }
.spacer { flex:1 }
.board-preview { display:flex; justify-content:center; align-items:center; background:transparent; border-radius:10px; overflow:hidden }
.preview-stage { width:100%; height:340px; position:relative; background:#f6f6f8; border-radius:8px; overflow:hidden; touch-action:none; cursor:grab; display:flex; align-items:center; justify-content:center }
.preview-content { will-change:transform; transition: transform 120ms linear; display:flex; align-items:center; justify-content:center; width:86%; height:90%; }
.preview-image { width:100%; height:100%; object-fit:cover; border-radius:6px }
.open-btn { position:absolute; right:10px; top:10px; z-index:10; padding:8px 12px; border-radius:8px; background:rgba(255,255,255,0.9); border:1px solid #ddd; cursor:pointer }
.board-actions { display:flex; gap:10px; align-items:center; justify-self:flex-end }
.icon-btn { border:1px solid #eee; background:#fff; padding:6px 10px; border-radius:18px; cursor:pointer }
.count { margin-left:6px; font-weight:600 }
</style>
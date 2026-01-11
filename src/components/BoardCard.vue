<template>
  <!--
    Carte de moodboard utilisée dans les listes (Explore, Search, profil, etc.).
    Elle affiche : l’owner, un aperçu interactif (pan/zoom) et des actions (like / commentaires).
    Un clic “normal” sur la carte ouvre la page détaillée du board.
  -->
  <article class="board-card" :class="{ dragging }" role="button" tabindex="0">
    <!-- En-tête : infos sur l’auteur + bouton Follow -->
    <div class="board-header">
      <img
        class="owner-avatar"
        :src="ownerAvatar"
        alt="avatar"
        v-if="board?.owner"
      />
      <div class="owner-meta">
        <!-- link to user profile -->
        <div class="owner-name" @click.stop="goToProfile">
          {{ board?.user || "unknown" }}
        </div>
        <div class="owner-sub small-muted">{{ boardSubtitle }}</div>
      </div>
      <div class="spacer"></div>
      <FollowButton
        v-if="showFollow && board?.userId"
        :userId="board.userId"
        :initialFollowing="board.owner?.viewerIsFollowing"
        @toggled.stop
      />
    </div>

    <!-- Preview interactif : on peut “tirer” l’image et zoomer à la molette -->
    <div class="board-preview" @click="onCardClick">
      <div
        class="preview-stage"
        ref="stage"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
        @wheel.prevent="onWheel"
      >
        <div class="preview-content" ref="content" :style="contentStyle">
          <img v-if="firstImage" :src="firstImage" class="preview-image" />
          <div v-else class="preview-placeholder">No preview</div>
        </div>

        <button class="open-btn" @click.stop="open">Open</button>
      </div>
    </div>

    <!-- Actions sous la carte (like + compteur de commentaires) -->
    <div class="board-actions" v-if="showActions">
      <LikeButton
        :boardId="String(board._id)"
        :username="board.user"
        :initialLiked="board.likedByUser || false"
        :initialCount="board.likes || 0"
      />
      <button class="icon-btn" @click.stop="openComments">💬</button>
    </div>
  </article>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import FollowButton from "./FollowButton.vue";
import api from "../services/api";
import LikeButton from "./LikeButton.vue";

// Props :
//  - board : données du board (obligatoire)
//  - showFollow : affiche ou non le bouton Follow sur l’auteur
//  - showActions : affiche ou non la barre de like / commentaires
const props = defineProps({
  board: { type: Object, required: true },
  showFollow: { type: Boolean, default: true },
  showActions: { type: Boolean, default: true },
});

const router = useRouter();

// Compteurs locaux, initialisés à partir des données du board
const likesCount = ref(props.board.likesCount ?? 0);

// Utiliser le thumbnail capturé, sinon fallback sur la première image
const firstImage = computed(() => {
  // Priorité au thumbnail capturé lors de la sauvegarde
  if (props.board.imageUrl) {
    return props.board.imageUrl;
  }
  // Sinon, chercher la première image dans les éléments
  const el = (props.board.elements || []).find((e) => e.type === "image");
  return el?.src || "";
});

// Avatar de l’owner (avec fallback)
const ownerAvatar = computed(
  () => props.board.owner?.avatar || "/placeholder-avatar.png"
);

// Sous-titre sous le nom : 3 premiers labels séparés par des puces
const boardSubtitle = computed(() =>
  (props.board.labels || []).slice(0, 3).join(" • ")
);

function goToProfile() {
  if (!props.board?.userId) return;
  router.push(`/profile/${props.board.userId}`);
}

// Ouvre la page détaillée du board
function open() {
  if (!props.board?._id) return;
  router.push(`/board/${props.board._id}`);
}

// Like / unlike optimiste, synchronisé avec l'API
async function toggleLike() {
  try {
    const liked = !!props.board.likedByUser || false;
    if (liked) {
      await api.boards.unlike(props.board._id);
      likesCount.value = Math.max(0, likesCount.value - 1);
      props.board.likedByUser = false;
    } else {
      await api.boards.like(props.board._id);
      likesCount.value = likesCount.value + 1;
      props.board.likedByUser = true;
    }
  } catch (e) {
    console.error("Like toggle failed:", e);
    // en mode front-only on ignore simplement les erreurs
  }
}

// Pour l’instant on ouvre simplement la board, les commentaires sont gérés dans BoardView
function openComments() {
  open();
}

// --- logique d’aperçu interactif (pan/zoom) ---
const stage = ref(null);
const content = ref(null);
const transform = ref({ x: 0, y: 0, s: 1 }); // x/y = position, s = zoom
let draggingLocal = false;
let last = { x: 0, y: 0 };
let moved = false;
const dragging = ref(false);

// Style calculé pour appliquer la transformation CSS
function contentStyle() {
  return {
    transform: `translate(${transform.value.x}px, ${transform.value.y}px) scale(${transform.value.s})`,
  };
}

// Démarrage du drag
function onPointerDown(e) {
  // seulement bouton principal / touch
  if (e.button && e.button !== 0) return;
  draggingLocal = true;
  dragging.value = true;
  moved = false;
  last.x = e.clientX;
  last.y = e.clientY;
  e.target.setPointerCapture?.(e.pointerId);
}

// Déplacement du drag
function onPointerMove(e) {
  if (!draggingLocal) return;
  const dx = e.clientX - last.x;
  const dy = e.clientY - last.y;
  if (Math.abs(dx) > 2 || Math.abs(dy) > 2) moved = true;
  transform.value.x += dx;
  transform.value.y += dy;
  last.x = e.clientX;
  last.y = e.clientY;
}

// Fin du drag
function onPointerUp(e) {
  draggingLocal = false;
  dragging.value = false;
  try {
    e.target.releasePointerCapture?.(e.pointerId);
  } catch {}
}

// Zoom à la molette autour du pointeur
function onWheel(e) {
  const delta = -e.deltaY / 500;
  const newS = Math.min(2.5, Math.max(0.4, transform.value.s + delta));
  const rect = stage.value.getBoundingClientRect();
  const px = e.clientX - rect.left;
  const py = e.clientY - rect.top;
  const ox = (px - transform.value.x) / transform.value.s;
  const oy = (py - transform.value.y) / transform.value.s;
  transform.value.s = newS;
  transform.value.x = px - ox * newS;
  transform.value.y = py - oy * newS;
}

// Empêche d’ouvrir la board si l’utilisateur était en train de dragger l’aperçu
function onCardClick() {
  if (moved) {
    moved = false;
    return; // drag consommé, on n’ouvre pas
  }
  open();
}
</script>

<style scoped>
.board-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #eee;
  display: flex;
  flex-direction: column;
  gap: 14px;
  cursor: default;
  max-width: 980px;
  margin: 0 auto;
}

.board-card.dragging {
  cursor: grabbing;
}

.board-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.owner-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #e6e6e6;
}

.owner-meta {
  display: flex;
  flex-direction: column;
}

.owner-name {
  font-weight: 600;
  font-size: 15px;
}

.spacer {
  flex: 1;
}

.board-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
  border-radius: 10px;
  overflow: hidden;
}

.preview-stage {
  width: 100%;
  position: relative;
  background: #f6f6f8;
  border-radius: 8px;
  overflow: hidden;
  touch-action: none;
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-content {
  will-change: transform;
  transition: transform 120ms linear;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.open-btn {
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 10;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #ddd;
  cursor: pointer;
}

.board-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-self: flex-end;
}

.icon-btn {
  border: 1px solid #eee;
  background: #fff;
  padding: 6px 10px;
  border-radius: 18px;
  cursor: pointer;
}

.count {
  margin-left: 6px;
  font-weight: 600;
}
</style>

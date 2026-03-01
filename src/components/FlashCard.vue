<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useWordStore } from '@/stores/wordStore'
import AudioBtn from '@/components/AudioBtn.vue'

const store = useWordStore()
const CARDS_PROGRESS_KEY = 'lv_cards_progress'
const VALID_FILTERS = new Set(['all', 'learning'])

// --- Filters ---
const selectedTheme = ref('All')
const selectedFilter = ref('all') // 'all' | 'learning'

const filteredWords = computed(() =>
  store.getFilteredWords(selectedTheme.value, selectedFilter.value)
)

// --- Card navigation ---
const currentIndex = ref(0)
const isFlipped = ref(false)
const hasHydrated = ref(false)

const currentWord = computed(() => filteredWords.value[currentIndex.value] || null)
const currentWordId = computed(() => currentWord.value?.id || null)
const wordStatus = computed(() =>
  currentWord.value ? store.getStatus(currentWord.value.id) : null
)
const total = computed(() => filteredWords.value.length)
const progress = computed(() =>
  total.value > 0 ? ((currentIndex.value + 1) / total.value) * 100 : 0
)

function clampCurrentIndex() {
  if (total.value <= 0) {
    currentIndex.value = 0
    return
  }
  if (currentIndex.value > total.value - 1) {
    currentIndex.value = total.value - 1
  } else if (currentIndex.value < 0) {
    currentIndex.value = 0
  }
}

function restoreCardProgress() {
  try {
    const raw = localStorage.getItem(CARDS_PROGRESS_KEY)
    if (!raw) return
    const saved = JSON.parse(raw)
    if (!saved || typeof saved !== 'object') return

    if (typeof saved.theme === 'string' && store.themes.includes(saved.theme)) {
      selectedTheme.value = saved.theme
    }
    if (typeof saved.filter === 'string' && VALID_FILTERS.has(saved.filter)) {
      selectedFilter.value = saved.filter
    }

    if (typeof saved.currentWordId === 'string') {
      const restoredIdx = filteredWords.value.findIndex(w => w.id === saved.currentWordId)
      if (restoredIdx >= 0) {
        currentIndex.value = restoredIdx
      }
    }
  } catch {
    // Ignore invalid localStorage data and keep defaults.
  }
}

function persistCardProgress() {
  if (!hasHydrated.value) return
  const payload = {
    theme: selectedTheme.value,
    filter: selectedFilter.value,
    currentWordId: currentWordId.value
  }
  try {
    localStorage.setItem(CARDS_PROGRESS_KEY, JSON.stringify(payload))
  } catch {
    // Ignore storage failures and keep app usable.
  }
}

function goNext() {
  if (currentIndex.value < total.value - 1) {
    isFlipped.value = false
    setTimeout(() => { currentIndex.value++ }, 100)
  }
}

function goPrev() {
  if (currentIndex.value > 0) {
    isFlipped.value = false
    setTimeout(() => { currentIndex.value-- }, 100)
  }
}

function flipCard() {
  isFlipped.value = !isFlipped.value
}

function handleKnown() {
  if (!currentWord.value) return
  const reviewedId = currentWord.value.id
  const reviewedIndex = currentIndex.value
  store.markKnown(reviewedId)
  isFlipped.value = false

  setTimeout(() => {
    // In "Not Mastered" view, mastered words are removed immediately.
    // If that happens, we are already on the next word and should not skip again.
    const wordStillAtSameIndex = filteredWords.value[reviewedIndex]?.id === reviewedId
    if (wordStillAtSameIndex && currentIndex.value < total.value - 1) {
      currentIndex.value++
    } else {
      clampCurrentIndex()
    }
  }, 100)
}

function handleUnknown() {
  if (!currentWord.value) return
  store.markUnknown(currentWord.value.id)
  goNext()
}

// Reset index when filter changes
function onFilterChange() {
  currentIndex.value = 0
  isFlipped.value = false
}

// --- Swipe gesture ---
let touchStartX = 0
let touchStartY = 0

function onTouchStart(e) {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}

function onTouchEnd(e) {
  const dx = e.changedTouches[0].clientX - touchStartX
  const dy = e.changedTouches[0].clientY - touchStartY
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
    if (dx < 0) goNext()
    else goPrev()
  }
}

// --- Keyboard navigation ---
function onKeyDown(e) {
  if (e.key === 'ArrowRight') goNext()
  else if (e.key === 'ArrowLeft') goPrev()
  else if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault()
    flipCard()
  }
}

watch(filteredWords, () => {
  clampCurrentIndex()
})

watch([selectedTheme, selectedFilter, currentWordId], () => {
  persistCardProgress()
})

onMounted(() => {
  restoreCardProgress()
  clampCurrentIndex()
  hasHydrated.value = true
  persistCardProgress()
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  persistCardProgress()
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<template>
  <div class="cards-view">
    <!-- Top bar: progress + filters -->
    <div class="cards-topbar">
      <div class="cards-progress-info">
        <span class="cards-counter" v-if="total > 0">{{ currentIndex + 1 }} / {{ total }}</span>
        <span class="cards-counter" v-else>No words</span>
        <div class="badge" v-if="wordStatus">
          {{ wordStatus.status === 'mastered' ? '✅ Mastered' :
             wordStatus.status === 'learning' ? '🔄 Learning' : '🆕 New' }}
        </div>
      </div>

      <div class="progress-bar">
        <div class="progress-bar-fill" :style="{ width: progress + '%' }"></div>
      </div>

      <div class="cards-filters">
        <select v-model="selectedTheme" @change="onFilterChange" class="filter-select">
          <option v-for="t in store.themes" :key="t" :value="t">
            {{ t === 'All' ? '📂 All Themes' : t }}
          </option>
        </select>
        <select v-model="selectedFilter" @change="onFilterChange" class="filter-select">
          <option value="all">All Words</option>
          <option value="learning">Not Mastered</option>
        </select>
      </div>
    </div>

    <!-- Flash Card -->
    <div
      v-if="currentWord"
      class="card-container"
      @touchstart="onTouchStart"
      @touchend="onTouchEnd"
    >
      <div class="flash-card" :class="{ flipped: isFlipped }" @click="flipCard">
        <!-- Front -->
        <div class="flash-card-face flash-card-front">
          <AudioBtn :text="currentWord.fr" size="lg" class="card-audio" />
          <div class="card-word">{{ currentWord.fr }}</div>
          <div class="card-pos">{{ currentWord.pos }}</div>
        </div>

        <!-- Back -->
        <div class="flash-card-face flash-card-back">
          <div class="card-ipa">{{ currentWord.ipa }}</div>
          <div class="card-en">{{ currentWord.en }}</div>
          <div class="card-example">
            <p class="example-fr">« {{ currentWord.example_fr }} »</p>
            <p class="example-en">{{ currentWord.example_en }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="cards-empty">
      <span class="placeholder-icon">🎉</span>
      <h3>All done!</h3>
      <p>No words match the current filter.</p>
      <button class="btn btn-primary" @click="selectedFilter = 'all'; onFilterChange()">
        Show all words
      </button>
    </div>

    <!-- Action bar -->
    <div class="cards-actions" v-if="currentWord">
      <button class="btn btn-ghost btn-icon" @click="goPrev" :disabled="currentIndex === 0">
        ◀
      </button>

      <transition name="fade">
        <div v-if="isFlipped" class="cards-verdict">
          <button class="btn btn-danger btn-lg" @click.stop="handleUnknown">
            ✗ Forgot
          </button>
          <button class="btn btn-success btn-lg" @click.stop="handleKnown">
            ✓ Got it
          </button>
        </div>
        <div v-else class="cards-hint">
          <span>Tap card to reveal</span>
        </div>
      </transition>

      <button class="btn btn-ghost btn-icon" @click="goNext" :disabled="currentIndex >= total - 1">
        ▶
      </button>
    </div>
  </div>
</template>

<style scoped>
.cards-view {
  display: flex;
  flex-direction: column;
  gap: var(--s-md);
  min-height: 70vh;
}

/* --- Top bar --- */
.cards-topbar {
  display: flex;
  flex-direction: column;
  gap: var(--s-sm);
}

.cards-progress-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cards-counter {
  font-weight: 600;
  font-size: var(--fs-sm);
  color: var(--c-text-secondary);
}

.cards-filters {
  display: flex;
  gap: var(--s-sm);
}

.filter-select {
  flex: 1;
  padding: var(--s-sm) var(--s-md);
  border-radius: var(--r-md);
  border: 1px solid var(--c-border);
  background: var(--c-surface);
  font-size: var(--fs-sm);
  font-family: var(--font-sans);
  color: var(--c-text);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 8.4L1.2 3.6h9.6z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 28px;
}

/* --- Flash Card --- */
.card-container {
  perspective: 1200px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
}

.flash-card {
  width: 100%;
  max-width: 400px;
  min-height: 300px;
  position: relative;
  transform-style: preserve-3d;
  transition: transform var(--t-flip);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.flash-card.flipped {
  transform: rotateY(180deg);
}

.flash-card-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--s-md);
  padding: var(--s-xl);
  border-radius: var(--r-xl);
  background: var(--c-surface);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--c-border-light);
}

.flash-card-back {
  transform: rotateY(180deg);
}

/* Front */
.card-audio {
  position: absolute;
  top: var(--s-md);
  right: var(--s-md);
}

.card-word {
  font-size: var(--fs-4xl);
  font-weight: 700;
  color: var(--c-text);
  text-align: center;
  letter-spacing: -0.02em;
}

.card-pos {
  font-size: var(--fs-sm);
  color: var(--c-text-muted);
  font-style: italic;
}

/* Back */
.card-ipa {
  font-size: var(--fs-lg);
  color: var(--c-text-muted);
  font-family: var(--font-mono);
}

.card-en {
  font-size: var(--fs-2xl);
  font-weight: 600;
  color: var(--c-primary);
  text-align: center;
}

.card-example {
  margin-top: var(--s-sm);
  text-align: center;
}

.example-fr {
  font-size: var(--fs-base);
  color: var(--c-text);
  font-style: italic;
  margin-bottom: var(--s-xs);
}

.example-en {
  font-size: var(--fs-sm);
  color: var(--c-text-secondary);
}

/* --- Actions --- */
.cards-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-md);
  min-height: 56px;
}

.cards-verdict {
  display: flex;
  gap: var(--s-md);
  flex: 1;
  justify-content: center;
}

.cards-hint {
  flex: 1;
  text-align: center;
  color: var(--c-text-muted);
  font-size: var(--fs-sm);
}

/* --- Empty state --- */
.cards-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--s-md);
  min-height: 50vh;
  color: var(--c-text-secondary);
}

.cards-empty h3 {
  font-size: var(--fs-xl);
  color: var(--c-text);
}
</style>

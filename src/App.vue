<script setup>
import { ref, computed } from 'vue'
import { useWordStore } from '@/stores/wordStore'
import FlashCard from '@/components/FlashCard.vue'
import QuizMode from '@/components/QuizMode.vue'

const store = useWordStore()

const tabs = [
  { id: 'cards', icon: '📚', label: 'Cards' },
  { id: 'quiz', icon: '✏️', label: 'Quiz' },
  { id: 'stats', icon: '📊', label: 'Stats' },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
]

const activeTab = ref('cards')

const storageWarningDismissed = ref(false)
const showStorageWarning = computed(
  () => !store.storageAvailable && !storageWarningDismissed.value
)
</script>

<template>
  <div class="app-main">
    <transition name="fade" mode="out-in">
      <FlashCard v-if="activeTab === 'cards'" key="cards" />
      <QuizMode v-else-if="activeTab === 'quiz'" key="quiz" />
      <div v-else-if="activeTab === 'stats'" key="stats">
        <div class="placeholder-view">
          <span class="placeholder-icon">📊</span>
          <h2>Stats</h2>
          <p>Mastered: {{ store.masteredCount }} / {{ store.words.length }}</p>
        </div>
      </div>
      <div v-else-if="activeTab === 'settings'" key="settings">
        <div class="placeholder-view">
          <span class="placeholder-icon">⚙️</span>
          <h2>Settings</h2>
          <p>Coming soon</p>
        </div>
      </div>
    </transition>
  </div>

  <!-- Bottom Navigation -->
  <nav class="nav-bar">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      class="nav-item"
      :class="{ active: activeTab === tab.id }"
      @click="activeTab = tab.id"
    >
      <span class="nav-icon">{{ tab.icon }}</span>
      <span>{{ tab.label }}</span>
    </button>
  </nav>

  <!-- Storage warning toast -->
  <transition name="fade">
    <div
      v-if="showStorageWarning"
      class="toast"
      @click="storageWarningDismissed = true"
    >
      ⚠️ Browser can't save data — progress will be lost on close
    </div>
  </transition>
</template>

<style scoped>
.placeholder-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: var(--s-md);
  color: var(--c-text-secondary);
}

.placeholder-icon {
  font-size: 3rem;
}

.placeholder-view h2 {
  font-size: var(--fs-2xl);
  font-weight: 700;
  color: var(--c-text);
}

.placeholder-view p {
  font-size: var(--fs-base);
}
</style>

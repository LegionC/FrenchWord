<script setup>
import { ref, computed } from 'vue'
import { useWordStore } from '@/stores/wordStore'
import FlashCard from '@/components/FlashCard.vue'
import QuizMode from '@/components/QuizMode.vue'
import StatsPanel from '@/components/StatsPanel.vue'
import SettingsPanel from '@/components/SettingsPanel.vue'
import OnboardingOverlay from '@/components/OnboardingOverlay.vue'

const store = useWordStore()

const tabs = [
  { id: 'cards', icon: '📚', label: 'Cards' },
  { id: 'quiz', icon: '✏️', label: 'Quiz' },
  { id: 'stats', icon: '📊', label: 'Stats' },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
]

const activeTab = ref('cards')

// Onboarding — show once, then remember
const onboardingDone = ref(!!localStorage.getItem('lv_onboarding_done'))

function dismissOnboarding() {
  onboardingDone.value = true
  try { localStorage.setItem('lv_onboarding_done', '1') } catch {}
}

const storageWarningDismissed = ref(false)
const showStorageWarning = computed(
  () => !store.storageAvailable && !storageWarningDismissed.value
)
</script>

<template>
  <!-- Onboarding -->
  <OnboardingOverlay v-if="!onboardingDone" @dismiss="dismissOnboarding" />

  <div class="app-main">
    <transition name="fade" mode="out-in">
      <FlashCard v-if="activeTab === 'cards'" key="cards" />
      <QuizMode v-else-if="activeTab === 'quiz'" key="quiz" />
      <StatsPanel v-else-if="activeTab === 'stats'" key="stats" />
      <SettingsPanel v-else-if="activeTab === 'settings'" key="settings" />
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

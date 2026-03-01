<script setup>
import { ref, computed } from 'vue'
import { useWordStore } from '@/stores/wordStore'
import FlashCard from '@/components/FlashCard.vue'
import QuizMode from '@/components/QuizMode.vue'
import StatsPanel from '@/components/StatsPanel.vue'
import SettingsPanel from '@/components/SettingsPanel.vue'
import OnboardingOverlay from '@/components/OnboardingOverlay.vue'
import AppIcon from '@/components/AppIcon.vue'

const store = useWordStore()

const tabs = [
  { id: 'cards', icon: 'cards', label: 'Cards' },
  { id: 'quiz', icon: 'quiz', label: 'Quiz' },
  { id: 'stats', icon: 'stats', label: 'Stats' },
  { id: 'settings', icon: 'settings', label: 'Settings' },
]

const activeTab = ref('cards')

// Onboarding — show once, then remember
function getOnboardingDone() {
  try {
    return !!localStorage.getItem('lv_onboarding_done')
  } catch {
    return false
  }
}

const onboardingDone = ref(getOnboardingDone())

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
      <span class="nav-icon"><AppIcon :name="tab.icon" :size="18" /></span>
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
      <AppIcon name="warning" :size="14" />
      Browser can't save data - progress will be lost on close
    </div>
  </transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useWordStore } from '@/stores/wordStore'

const store = useWordStore()

// Local copies for editing
const dailyGoal = ref(store.settings.dailyGoal)
const ttsSpeed = ref(store.settings.ttsSpeed)
const quizRatio = ref(store.settings.quizChoiceRatio)

function saveSettings() {
  store.updateSettings({
    dailyGoal: dailyGoal.value,
    ttsSpeed: ttsSpeed.value,
    quizChoiceRatio: quizRatio.value
  })
  saved.value = true
  setTimeout(() => saved.value = false, 2000)
}

const saved = ref(false)

// --- Data management ---
const showResetConfirm = ref(false)

function confirmReset() {
  store.resetAllData()
  showResetConfirm.value = false
}

function exportData() {
  const data = store.exportData()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `le-vocabulaire-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function importData(event) {
  const input = event.target
  const file = input?.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    const ok = store.importData(e.target.result)
    if (ok) {
      dailyGoal.value = store.settings.dailyGoal
      ttsSpeed.value = store.settings.ttsSpeed
      quizRatio.value = store.settings.quizChoiceRatio
      alert('Data imported successfully!')
    } else {
      alert('Failed to import data. Invalid file format.')
    }
    if (input) input.value = ''
  }
  reader.readAsText(file)
}
</script>

<template>
  <div class="settings-view">
    <h2 class="settings-title">⚙️ Settings</h2>

    <!-- Learning preferences -->
    <div class="settings-section">
      <h3>Learning</h3>

      <label class="setting-item">
        <div class="setting-info">
          <span class="setting-label">Daily Goal</span>
          <span class="setting-value">{{ dailyGoal }} words</span>
        </div>
        <input type="range" v-model.number="dailyGoal" min="5" max="50" step="5" class="setting-slider" />
      </label>

      <label class="setting-item">
        <div class="setting-info">
          <span class="setting-label">TTS Speed</span>
          <span class="setting-value">{{ ttsSpeed === 1 ? 'Normal' : 'Slow' }}</span>
        </div>
        <div class="speed-toggle">
          <button
            class="btn"
            :class="ttsSpeed === 0.7 ? 'btn-primary' : 'btn-ghost'"
            @click="ttsSpeed = 0.7"
          >🐢 Slow</button>
          <button
            class="btn"
            :class="ttsSpeed === 1 ? 'btn-primary' : 'btn-ghost'"
            @click="ttsSpeed = 1"
          >🐇 Normal</button>
        </div>
      </label>

      <label class="setting-item">
        <div class="setting-info">
          <span class="setting-label">Default Quiz Ratio</span>
          <span class="setting-value">Choice {{ quizRatio }}% / Spelling {{ 100 - quizRatio }}%</span>
        </div>
        <input type="range" v-model.number="quizRatio" min="0" max="100" step="10" class="setting-slider" />
      </label>

      <button class="btn btn-primary btn-lg save-btn" @click="saveSettings">
        {{ saved ? '✅ Saved!' : 'Save Settings' }}
      </button>
    </div>

    <!-- Data management -->
    <div class="settings-section">
      <h3>Data Management</h3>

      <div class="data-actions">
        <button class="btn btn-ghost btn-lg" @click="exportData">
          📤 Export Learning Data
        </button>

        <label class="btn btn-ghost btn-lg import-label">
          📥 Import Learning Data
          <input type="file" accept=".json" @change="importData" class="import-input" />
        </label>

        <button
          v-if="!showResetConfirm"
          class="btn btn-ghost btn-lg reset-btn"
          @click="showResetConfirm = true"
        >
          🗑️ Reset All Data
        </button>

        <div v-else class="reset-confirm">
          <p class="reset-warning">⚠️ This will erase all learning progress. Are you sure?</p>
          <div class="reset-actions">
            <button class="btn btn-danger" @click="confirmReset">Yes, Reset</button>
            <button class="btn btn-ghost" @click="showResetConfirm = false">Cancel</button>
          </div>
        </div>
      </div>
    </div>

    <!-- About -->
    <div class="settings-section about-section">
      <h3>About</h3>
      <p>Le Vocabulaire v1.0</p>
      <p>{{ store.words.length }} words · {{ Object.keys(store.themeMastery).length }} themes</p>
      <p class="about-muted">Data stored locally in your browser.</p>
    </div>
  </div>
</template>

<style scoped>
.settings-view {
  display: flex;
  flex-direction: column;
  gap: var(--s-lg);
  padding: var(--s-md) 0;
}

.settings-title {
  font-size: var(--fs-2xl);
  font-weight: 700;
}

.settings-section {
  background: var(--c-surface);
  border: 1px solid var(--c-border-light);
  border-radius: var(--r-lg);
  padding: var(--s-md);
}

.settings-section h3 {
  font-size: var(--fs-base);
  font-weight: 600;
  margin-bottom: var(--s-md);
  color: var(--c-text-secondary);
}

/* Setting items */
.setting-item {
  display: flex;
  flex-direction: column;
  gap: var(--s-xs);
  padding: var(--s-sm) 0;
  border-bottom: 1px solid var(--c-border-light);
}

.setting-item:last-of-type {
  border-bottom: none;
}

.setting-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.setting-label {
  font-size: var(--fs-sm);
  font-weight: 500;
}

.setting-value {
  font-size: var(--fs-sm);
  color: var(--c-primary);
  font-weight: 600;
}

.setting-slider {
  width: 100%;
  accent-color: var(--c-primary);
}

.speed-toggle {
  display: flex;
  gap: var(--s-xs);
}

.save-btn {
  width: 100%;
  margin-top: var(--s-md);
}

/* Data management */
.data-actions {
  display: flex;
  flex-direction: column;
  gap: var(--s-sm);
}

.import-label {
  cursor: pointer;
  text-align: center;
}

.import-input {
  display: none;
}

.reset-btn {
  color: var(--c-danger);
}

.reset-confirm {
  padding: var(--s-md);
  background: var(--c-danger-bg);
  border-radius: var(--r-md);
}

.reset-warning {
  font-size: var(--fs-sm);
  margin-bottom: var(--s-sm);
  font-weight: 500;
}

.reset-actions {
  display: flex;
  gap: var(--s-sm);
}

/* About */
.about-section p {
  font-size: var(--fs-sm);
  color: var(--c-text-secondary);
  line-height: 1.6;
}

.about-muted {
  color: var(--c-text-muted) !important;
  font-size: var(--fs-xs) !important;
  margin-top: var(--s-xs);
}
</style>

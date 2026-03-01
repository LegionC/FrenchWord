<script setup>
const props = defineProps({
  results: { type: Object, required: true }
  // { score, total, accuracy, timeSeconds, maxStreak, wrongAnswers: [{word, userAnswer}] }
})

const emit = defineEmits(['retry', 'review-wrong', 'back'])

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function gradeEmoji(accuracy) {
  if (accuracy >= 90) return '🏆'
  if (accuracy >= 70) return '🌟'
  if (accuracy >= 50) return '👍'
  return '💪'
}
</script>

<template>
  <div class="quiz-result">
    <div class="result-header">
      <span class="result-emoji">{{ gradeEmoji(results.accuracy) }}</span>
      <h2 class="result-title">Quiz Complete!</h2>
    </div>

    <div class="result-stats">
      <div class="stat-card">
        <div class="stat-value">{{ results.score }}<span class="stat-unit">/{{ results.total }}</span></div>
        <div class="stat-label">Score</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ results.accuracy }}<span class="stat-unit">%</span></div>
        <div class="stat-label">Accuracy</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ formatTime(results.timeSeconds) }}</div>
        <div class="stat-label">Time</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ results.maxStreak }}</div>
        <div class="stat-label">Best Streak</div>
      </div>
    </div>

    <!-- Wrong answers -->
    <div v-if="results.wrongAnswers.length > 0" class="wrong-section">
      <h3>📝 Review These Words ({{ results.wrongAnswers.length }})</h3>
      <div class="wrong-list">
        <div v-for="item in results.wrongAnswers" :key="item.word.id" class="wrong-item">
          <div class="wrong-fr">{{ item.word.fr }}</div>
          <div class="wrong-en">{{ item.word.en }}</div>
        </div>
      </div>
    </div>

    <div class="result-actions">
      <button class="btn btn-primary btn-lg" @click="emit('retry')">
        🔄 Try Again
      </button>
      <button
        v-if="results.wrongAnswers.length > 0"
        class="btn btn-ghost btn-lg"
        @click="emit('review-wrong')"
      >
        📚 Review Wrong Answers
      </button>
      <button class="btn btn-ghost btn-lg" @click="emit('back')">
        ← Back to Menu
      </button>
    </div>
  </div>
</template>

<style scoped>
.quiz-result {
  display: flex;
  flex-direction: column;
  gap: var(--s-lg);
  padding: var(--s-md) 0;
}

.result-header {
  text-align: center;
  padding: var(--s-lg) 0;
}

.result-emoji {
  font-size: 3.5rem;
  display: block;
  margin-bottom: var(--s-sm);
}

.result-title {
  font-size: var(--fs-2xl);
  font-weight: 700;
}

/* Stats grid */
.result-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--s-sm);
}

.stat-card {
  background: var(--c-surface);
  border: 1px solid var(--c-border-light);
  border-radius: var(--r-lg);
  padding: var(--s-md);
  text-align: center;
}

.stat-value {
  font-size: var(--fs-2xl);
  font-weight: 700;
  color: var(--c-primary);
}

.stat-unit {
  font-size: var(--fs-base);
  font-weight: 500;
  color: var(--c-text-muted);
}

.stat-label {
  font-size: var(--fs-xs);
  color: var(--c-text-muted);
  font-weight: 500;
  margin-top: var(--s-xs);
}

/* Wrong answers */
.wrong-section h3 {
  font-size: var(--fs-base);
  font-weight: 600;
  margin-bottom: var(--s-sm);
}

.wrong-list {
  display: flex;
  flex-direction: column;
  gap: var(--s-xs);
}

.wrong-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--s-sm) var(--s-md);
  background: var(--c-danger-bg);
  border-radius: var(--r-md);
}

.wrong-fr {
  font-weight: 600;
  color: var(--c-text);
}

.wrong-en {
  font-size: var(--fs-sm);
  color: var(--c-text-secondary);
}

/* Actions */
.result-actions {
  display: flex;
  flex-direction: column;
  gap: var(--s-sm);
}
</style>

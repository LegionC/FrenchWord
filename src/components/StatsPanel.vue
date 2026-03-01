<script setup>
import { computed } from 'vue'
import { useWordStore } from '@/stores/wordStore'

const store = useWordStore()

const dailyProgress = computed(() => {
  const pct = store.settings.dailyGoal > 0
    ? Math.min(100, Math.round((store.todayReviewed / store.settings.dailyGoal) * 100))
    : 0
  return pct
})

const recentQuizzes = computed(() => store.quizHistory.slice(0, 5))
</script>

<template>
  <div class="stats-view">
    <h2 class="stats-title">Learning Stats</h2>

    <!-- Summary cards -->
    <div class="stats-grid">
      <div class="stat-card stat-primary">
        <div class="stat-value">{{ store.todayReviewed }}<span class="stat-unit">/{{ store.settings.dailyGoal }}</span></div>
        <div class="stat-label">Today's Words</div>
        <div class="progress-bar" style="margin-top: 8px">
          <div class="progress-bar-fill" :style="{ width: dailyProgress + '%' }"></div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-value">{{ store.masteryRate }}<span class="stat-unit">%</span></div>
        <div class="stat-label">Mastery Rate</div>
      </div>

      <div class="stat-card">
        <div class="stat-value">{{ store.streakData.count }}</div>
        <div class="stat-label">Day Streak</div>
      </div>

      <div class="stat-card">
        <div class="stat-value">{{ store.masteredCount }}<span class="stat-unit">/{{ store.words.length }}</span></div>
        <div class="stat-label">Words Mastered</div>
      </div>
    </div>

    <!-- Theme breakdown -->
    <div class="stats-section">
      <h3>Theme Progress</h3>
      <div class="theme-list">
        <div v-for="(data, theme) in store.themeMastery" :key="theme" class="theme-item">
          <div class="theme-header">
            <span class="theme-name">{{ theme }}</span>
            <span class="theme-count">{{ data.mastered }}/{{ data.total }}</span>
          </div>
          <div class="progress-bar">
            <div
              class="progress-bar-fill"
              :style="{
                width: data.rate + '%',
                background: data.rate === 100
                  ? 'var(--c-success)'
                  : data.rate > 50
                    ? 'linear-gradient(90deg, var(--c-primary), var(--c-primary-light))'
                    : 'var(--c-warning)'
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent quizzes -->
    <div v-if="recentQuizzes.length > 0" class="stats-section">
      <h3>Recent Quizzes</h3>
      <div class="quiz-history">
        <div v-for="(q, i) in recentQuizzes" :key="i" class="quiz-history-item">
          <div class="qh-date">{{ new Date(q.date).toLocaleDateString() }}</div>
          <div class="qh-score">{{ q.score }}/{{ q.total }}</div>
          <div class="qh-accuracy" :class="q.accuracy >= 70 ? 'qh-good' : 'qh-bad'">
            {{ q.accuracy }}%
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-view {
  display: flex;
  flex-direction: column;
  gap: var(--s-lg);
  padding: var(--s-md) 0;
}

.stats-title {
  font-size: var(--fs-2xl);
  font-weight: 700;
}

/* Grid */
.stats-grid {
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

.stat-primary {
  grid-column: 1 / -1;
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

/* Sections */
.stats-section h3 {
  font-size: var(--fs-base);
  font-weight: 600;
  margin-bottom: var(--s-sm);
}

/* Theme list */
.theme-list {
  display: flex;
  flex-direction: column;
  gap: var(--s-sm);
}

.theme-item {
  padding: var(--s-sm) var(--s-md);
  background: var(--c-surface);
  border-radius: var(--r-md);
  border: 1px solid var(--c-border-light);
}

.theme-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--s-xs);
}

.theme-name {
  font-size: var(--fs-sm);
  font-weight: 500;
}

.theme-count {
  font-size: var(--fs-xs);
  color: var(--c-text-muted);
}

/* Quiz history */
.quiz-history {
  display: flex;
  flex-direction: column;
  gap: var(--s-xs);
}

.quiz-history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--s-sm) var(--s-md);
  background: var(--c-surface);
  border-radius: var(--r-md);
  font-size: var(--fs-sm);
  border: 1px solid var(--c-border-light);
}

.qh-date { color: var(--c-text-secondary); }
.qh-score { font-weight: 600; }
.qh-good { color: var(--c-success); font-weight: 600; }
.qh-bad { color: var(--c-danger); font-weight: 600; }
</style>

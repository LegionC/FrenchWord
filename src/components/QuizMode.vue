<script setup>
import { ref, computed } from 'vue'
import { useWordStore } from '@/stores/wordStore'
import { generateQuiz } from '@/utils/quiz'
import QuizChoice from '@/components/QuizChoice.vue'
import QuizSpelling from '@/components/QuizSpelling.vue'
import QuizResult from '@/components/QuizResult.vue'

const store = useWordStore()

// --- Quiz state machine: config → active → result ---
const phase = ref('config') // 'config' | 'active' | 'result'

// --- Config ---
const configCount = ref(10)
const configTheme = ref('All')
const configScope = ref('all') // 'all' | 'learning'
const configChoiceRatio = ref(store.settings.quizChoiceRatio)

// --- Active quiz ---
const questions = ref([])
const currentIdx = ref(0)
const score = ref(0)
const maxStreak = ref(0)
const currentStreak = ref(0)
const wrongAnswers = ref([])
const startTime = ref(null)
const showFeedback = ref(false)

const currentQuestion = computed(() => questions.value[currentIdx.value] || null)
const progress = computed(() =>
  questions.value.length > 0 ? ((currentIdx.value + 1) / questions.value.length) * 100 : 0
)

// --- Start quiz ---
function startQuiz() {
  const pool = store.getFilteredWords(configTheme.value, configScope.value)
  if (pool.length < 4) return // Need at least 4 words for choice questions

  const count = configCount.value === 'all' ? pool.length : Math.min(configCount.value, pool.length)
  questions.value = generateQuiz(pool, count, configChoiceRatio.value, store.words)
  currentIdx.value = 0
  score.value = 0
  maxStreak.value = 0
  currentStreak.value = 0
  wrongAnswers.value = []
  startTime.value = Date.now()
  showFeedback.value = false
  phase.value = 'active'
}

// --- Handle answer ---
function onAnswer(result) {
  showFeedback.value = true

  if (result.correct) {
    const pts = result.hintUsed ? 0.5 : 1
    score.value += pts
    currentStreak.value += 1
    if (currentStreak.value > maxStreak.value) {
      maxStreak.value = currentStreak.value
    }
  } else {
    currentStreak.value = 0
    wrongAnswers.value.push({
      word: currentQuestion.value.word,
      userAnswer: result.userAnswer || result.selectedId
    })
    store.markQuizWrong(currentQuestion.value.word.id)
  }

  // Auto-advance after 1.5s
  setTimeout(() => {
    showFeedback.value = false
    if (currentIdx.value < questions.value.length - 1) {
      currentIdx.value++
    } else {
      finishQuiz()
    }
  }, 1500)
}

// --- Finish ---
const results = ref(null)

function finishQuiz() {
  const elapsed = Math.round((Date.now() - startTime.value) / 1000)
  results.value = {
    score: Math.round(score.value * 10) / 10,
    total: questions.value.length,
    accuracy: Math.round((score.value / questions.value.length) * 100),
    timeSeconds: elapsed,
    maxStreak: maxStreak.value,
    wrongAnswers: wrongAnswers.value
  }

  store.addQuizResult({
    date: new Date().toISOString(),
    score: results.value.score,
    total: results.value.total,
    accuracy: results.value.accuracy,
    timeSeconds: elapsed,
    wrongIds: wrongAnswers.value.map(w => w.word.id)
  })

  phase.value = 'result'
}

function retry() {
  startQuiz()
}

function reviewWrong() {
  // Re-quiz only the wrong answers
  const pool = wrongAnswers.value.map(w => w.word)
  if (pool.length < 2) return
  configCount.value = pool.length
  const count = pool.length
  questions.value = generateQuiz(pool, count, configChoiceRatio.value, store.words)
  currentIdx.value = 0
  score.value = 0
  maxStreak.value = 0
  currentStreak.value = 0
  wrongAnswers.value = []
  startTime.value = Date.now()
  showFeedback.value = false
  phase.value = 'active'
}

function backToConfig() {
  phase.value = 'config'
}
</script>

<template>
  <div class="quiz-view">
    <!-- CONFIG PHASE -->
    <div v-if="phase === 'config'" class="quiz-config">
      <h2 class="config-title">✏️ Quiz Setup</h2>

      <div class="config-form">
        <label class="config-field">
          <span class="config-label">Questions</span>
          <select v-model="configCount" class="filter-select">
            <option :value="10">10 questions</option>
            <option :value="20">20 questions</option>
            <option value="all">All words</option>
          </select>
        </label>

        <label class="config-field">
          <span class="config-label">Theme</span>
          <select v-model="configTheme" class="filter-select">
            <option v-for="t in store.themes" :key="t" :value="t">
              {{ t === 'All' ? 'All Themes' : t }}
            </option>
          </select>
        </label>

        <label class="config-field">
          <span class="config-label">Scope</span>
          <select v-model="configScope" class="filter-select">
            <option value="all">All Words</option>
            <option value="learning">Not Mastered Only</option>
          </select>
        </label>

        <label class="config-field">
          <span class="config-label">Choice vs Spelling: {{ configChoiceRatio }}% / {{ 100 - configChoiceRatio }}%</span>
          <input type="range" v-model.number="configChoiceRatio" min="0" max="100" step="10" class="config-slider" />
          <div class="config-slider-labels">
            <span>All Spelling</span>
            <span>All Choice</span>
          </div>
        </label>
      </div>

      <button class="btn btn-primary btn-lg config-start" @click="startQuiz">
        Start Quiz 🚀
      </button>
    </div>

    <!-- ACTIVE PHASE -->
    <div v-else-if="phase === 'active'" class="quiz-active">
      <div class="quiz-topbar">
        <span class="quiz-counter">{{ currentIdx + 1 }} / {{ questions.length }}</span>
        <span class="quiz-score">Score: {{ score }}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-bar-fill" :style="{ width: progress + '%' }"></div>
      </div>

      <transition name="slide-up" mode="out-in">
        <QuizChoice
          v-if="currentQuestion?.type === 'choice'"
          :key="currentIdx"
          :question="currentQuestion"
          @answer="onAnswer"
        />
        <QuizSpelling
          v-else-if="currentQuestion?.type === 'spelling'"
          :key="currentIdx"
          :question="currentQuestion"
          @answer="onAnswer"
        />
      </transition>
    </div>

    <!-- RESULT PHASE -->
    <QuizResult
      v-else-if="phase === 'result' && results"
      :results="results"
      @retry="retry"
      @review-wrong="reviewWrong"
      @back="backToConfig"
    />
  </div>
</template>

<style scoped>
.quiz-view {
  min-height: 70vh;
}

/* Config */
.quiz-config {
  display: flex;
  flex-direction: column;
  gap: var(--s-lg);
  padding: var(--s-lg) 0;
}

.config-title {
  font-size: var(--fs-2xl);
  font-weight: 700;
  text-align: center;
}

.config-form {
  display: flex;
  flex-direction: column;
  gap: var(--s-md);
}

.config-field {
  display: flex;
  flex-direction: column;
  gap: var(--s-xs);
}

.config-label {
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--c-text-secondary);
}

.config-slider {
  width: 100%;
  accent-color: var(--c-primary);
  height: 6px;
}

.config-slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: var(--fs-xs);
  color: var(--c-text-muted);
}

.config-start {
  margin-top: var(--s-md);
  width: 100%;
}

/* Active */
.quiz-active {
  display: flex;
  flex-direction: column;
  gap: var(--s-md);
}

.quiz-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quiz-counter {
  font-weight: 600;
  font-size: var(--fs-sm);
  color: var(--c-text-secondary);
}

.quiz-score {
  font-weight: 600;
  font-size: var(--fs-sm);
  color: var(--c-primary);
}
</style>

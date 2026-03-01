<script setup>
import { ref, computed, nextTick } from 'vue'
import AudioBtn from '@/components/AudioBtn.vue'
import { checkSpelling, diffAnswer } from '@/utils/quiz'

const props = defineProps({
  question: { type: Object, required: true }
})

const emit = defineEmits(['answer'])

const userInput = ref('')
const answered = ref(false)
const showHint = ref(false)
const inputRef = ref(null)
const diff = ref([])

const accentChars = [
  'é', 'è', 'ê', 'ë',
  'à', 'â',
  'ù', 'û',
  'î', 'ï',
  'ô',
  'ç', 'œ', 'æ', 'ÿ'
]

function insertAccent(char) {
  userInput.value += char
  nextTick(() => inputRef.value?.focus())
}

function revealHint() {
  showHint.value = true
}

function submit() {
  if (answered.value || !userInput.value.trim()) return
  answered.value = true
  const isCorrect = checkSpelling(userInput.value, props.question.word.fr)
  diff.value = diffAnswer(userInput.value, props.question.word.fr)
  emit('answer', {
    correct: isCorrect,
    userAnswer: userInput.value,
    hintUsed: showHint.value
  })
}

function onKeydown(e) {
  if (e.key === 'Enter') submit()
}
</script>

<template>
  <div class="quiz-spelling">
    <div class="question-header">
      <AudioBtn :text="question.word.fr" size="md" />
      <div class="question-en">{{ question.word.en }}</div>
      <div class="question-pos">{{ question.word.pos }}</div>
    </div>

    <p class="question-prompt">Type the French word:</p>

    <!-- Hint -->
    <div class="hint-area">
      <button v-if="!showHint && !answered" class="btn btn-ghost" @click="revealHint">
        💡 Show hint (-0.5 pts)
      </button>
      <div v-if="showHint" class="hint-text">
        Starts with: <strong>{{ question.word.fr[0].toUpperCase() }}...</strong>
      </div>
    </div>

    <!-- Input -->
    <div class="input-area" v-if="!answered">
      <input
        ref="inputRef"
        v-model="userInput"
        type="text"
        class="spelling-input"
        placeholder="Type here..."
        autocomplete="off"
        autocapitalize="off"
        @keydown="onKeydown"
      />
      <button class="btn btn-primary btn-lg" @click="submit" :disabled="!userInput.trim()">
        Check ✓
      </button>
    </div>

    <!-- Answer feedback -->
    <div v-if="answered" class="answer-feedback">
      <div class="diff-display">
        <span
          v-for="(d, i) in diff"
          :key="i"
          class="diff-char"
          :class="d.match ? 'diff-match' : 'diff-mismatch'"
        >{{ d.userChar || '·' }}</span>
      </div>
      <div class="correct-answer">
        ✅ Correct: <strong>{{ question.word.fr }}</strong>
      </div>
    </div>

    <!-- Accent keyboard -->
    <div class="accent-keyboard" v-if="!answered">
      <button
        v-for="ch in accentChars"
        :key="ch"
        class="accent-key"
        @click="insertAccent(ch)"
      >{{ ch }}</button>
    </div>
  </div>
</template>

<style scoped>
.quiz-spelling {
  display: flex;
  flex-direction: column;
  gap: var(--s-md);
}

.question-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--s-sm);
  padding: var(--s-lg) 0;
}

.question-en {
  font-size: var(--fs-2xl);
  font-weight: 700;
  color: var(--c-primary);
  text-align: center;
}

.question-pos {
  font-size: var(--fs-sm);
  color: var(--c-text-muted);
  font-style: italic;
}

.question-prompt {
  font-size: var(--fs-sm);
  color: var(--c-text-secondary);
  text-align: center;
}

.hint-area {
  text-align: center;
  min-height: 36px;
}

.hint-text {
  font-size: var(--fs-sm);
  color: var(--c-warning);
}

/* Input */
.input-area {
  display: flex;
  gap: var(--s-sm);
}

.spelling-input {
  flex: 1;
  padding: var(--s-md);
  border: 2px solid var(--c-border);
  border-radius: var(--r-lg);
  font-size: var(--fs-lg);
  background: var(--c-surface);
  outline: none;
  transition: border-color var(--t-fast);
}

.spelling-input:focus {
  border-color: var(--c-primary);
}

/* Answer feedback */
.answer-feedback {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--s-md);
  padding: var(--s-lg);
  background: var(--c-surface);
  border-radius: var(--r-lg);
  border: 1px solid var(--c-border-light);
}

.diff-display {
  font-size: var(--fs-2xl);
  font-family: var(--font-mono);
  letter-spacing: 2px;
}

.diff-char {
  display: inline-block;
  padding: 2px 4px;
  border-radius: 3px;
}

.diff-match {
  color: var(--c-success);
  background: var(--c-success-bg);
}

.diff-mismatch {
  color: var(--c-danger);
  background: var(--c-danger-bg);
  text-decoration: line-through;
}

.correct-answer {
  font-size: var(--fs-base);
  color: var(--c-text-secondary);
}

/* Accent keyboard */
.accent-keyboard {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-xs);
  justify-content: center;
  padding: var(--s-sm);
  background: var(--c-surface-hover);
  border-radius: var(--r-lg);
}

.accent-key {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--r-sm);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  font-size: var(--fs-base);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--t-fast);
  -webkit-tap-highlight-color: transparent;
}

.accent-key:hover {
  background: var(--c-primary-glow);
  border-color: var(--c-primary-light);
}

.accent-key:active {
  transform: scale(0.95);
}
</style>

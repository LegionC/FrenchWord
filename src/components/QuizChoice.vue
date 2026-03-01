<script setup>
import { ref, computed } from 'vue'
import AudioBtn from '@/components/AudioBtn.vue'

const props = defineProps({
  question: { type: Object, required: true }
})

const emit = defineEmits(['answer'])

const selected = ref(null)
const answered = ref(false)

function selectOption(option) {
  if (answered.value) return
  selected.value = option.id
  answered.value = true
  emit('answer', {
    correct: option.correct,
    selectedId: option.id,
    correctId: props.question.word.id
  })
}

function optionClass(option) {
  if (!answered.value) return ''
  if (option.correct) return 'option--correct'
  if (option.id === selected.value && !option.correct) return 'option--wrong'
  return 'option--dimmed'
}
</script>

<template>
  <div class="quiz-choice">
    <div class="question-header">
      <AudioBtn :text="question.word.fr" size="md" />
      <div class="question-word">{{ question.word.fr }}</div>
      <div class="question-pos">{{ question.word.pos }}</div>
    </div>

    <p class="question-prompt">Choose the correct English meaning:</p>

    <div class="options-grid">
      <button
        v-for="(opt, i) in question.options"
        :key="opt.id"
        class="option-btn"
        :class="optionClass(opt)"
        @click="selectOption(opt)"
        :disabled="answered"
      >
        <span class="option-letter">{{ ['A', 'B', 'C', 'D'][i] }}</span>
        <span class="option-text">{{ opt.en }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.quiz-choice {
  display: flex;
  flex-direction: column;
  gap: var(--s-lg);
}

.question-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--s-sm);
  padding: var(--s-xl) 0;
}

.question-word {
  font-size: var(--fs-3xl);
  font-weight: 700;
  color: var(--c-text);
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

.options-grid {
  display: flex;
  flex-direction: column;
  gap: var(--s-sm);
}

.option-btn {
  display: flex;
  align-items: center;
  gap: var(--s-md);
  padding: var(--s-md);
  border-radius: var(--r-lg);
  background: var(--c-surface);
  border: 2px solid var(--c-border);
  text-align: left;
  transition: all var(--t-fast);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.option-btn:hover:not(:disabled) {
  border-color: var(--c-primary-light);
  background: var(--c-primary-glow);
}

.option-letter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--r-sm);
  background: var(--c-surface-hover);
  font-weight: 700;
  font-size: var(--fs-sm);
  color: var(--c-text-secondary);
  flex-shrink: 0;
}

.option-text {
  font-size: var(--fs-base);
  line-height: 1.4;
}

/* Answer states */
.option--correct {
  border-color: var(--c-success) !important;
  background: var(--c-success-bg) !important;
}
.option--correct .option-letter {
  background: var(--c-success);
  color: white;
}

.option--wrong {
  border-color: var(--c-danger) !important;
  background: var(--c-danger-bg) !important;
}
.option--wrong .option-letter {
  background: var(--c-danger);
  color: white;
}

.option--dimmed {
  opacity: 0.4;
}
</style>

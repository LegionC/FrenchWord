<script setup>
import { ref } from 'vue'

const emit = defineEmits(['dismiss'])

const step = ref(0)

const steps = [
  {
    emoji: '🇫🇷',
    title: 'Bienvenue!',
    text: 'Welcome to Le Vocabulaire — your personal French word trainer with 414 A1-level words.'
  },
  {
    emoji: '📚',
    title: 'Learn with Cards',
    text: 'Flip cards to learn French words. Tap ✓ Got it or ✗ Forgot to track your progress. Master a word by getting it right 3 times in a row.'
  },
  {
    emoji: '✏️',
    title: 'Test with Quizzes',
    text: 'Challenge yourself with multiple choice and spelling quizzes. Use the accent keyboard for special French characters.'
  },
  {
    emoji: '📊',
    title: 'Track Your Progress',
    text: 'All progress is saved in your browser. Check the Stats tab to see how you\'re doing across themes.'
  }
]

function next() {
  if (step.value < steps.length - 1) {
    step.value++
  } else {
    emit('dismiss')
  }
}

function skip() {
  emit('dismiss')
}
</script>

<template>
  <div class="onboarding-overlay" @click.self="skip">
    <div class="onboarding-card">
      <transition name="slide-up" mode="out-in">
        <div :key="step" class="onboarding-content">
          <span class="onboarding-emoji">{{ steps[step].emoji }}</span>
          <h2>{{ steps[step].title }}</h2>
          <p>{{ steps[step].text }}</p>
        </div>
      </transition>

      <!-- Dots -->
      <div class="onboarding-dots">
        <span
          v-for="(_, i) in steps"
          :key="i"
          class="dot"
          :class="{ active: i === step, done: i < step }"
        ></span>
      </div>

      <div class="onboarding-actions">
        <button class="btn btn-ghost" @click="skip">Skip</button>
        <button class="btn btn-primary btn-lg" @click="next">
          {{ step < steps.length - 1 ? 'Next →' : 'Start Learning 🚀' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.onboarding-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
  padding: var(--s-md);
}

.onboarding-card {
  background: var(--c-surface);
  border-radius: var(--r-xl);
  padding: var(--s-2xl) var(--s-xl);
  max-width: 420px;
  width: 100%;
  box-shadow: var(--shadow-xl);
  text-align: center;
}

.onboarding-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--s-md);
  min-height: 180px;
  justify-content: center;
}

.onboarding-emoji {
  font-size: 3.5rem;
}

.onboarding-content h2 {
  font-size: var(--fs-2xl);
  font-weight: 700;
}

.onboarding-content p {
  font-size: var(--fs-base);
  color: var(--c-text-secondary);
  line-height: 1.6;
}

/* Dots */
.onboarding-dots {
  display: flex;
  justify-content: center;
  gap: var(--s-sm);
  margin: var(--s-lg) 0;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: var(--r-full);
  background: var(--c-border);
  transition: all var(--t-base);
}
.dot.active {
  width: 24px;
  background: var(--c-primary);
}
.dot.done {
  background: var(--c-primary-light);
}

/* Actions */
.onboarding-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--s-md);
}
</style>

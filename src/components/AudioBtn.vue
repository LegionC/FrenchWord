<script setup>
import { ref } from 'vue'
import { speak, isTTSSupported } from '@/utils/speech'
import { useWordStore } from '@/stores/wordStore'
import AppIcon from '@/components/AppIcon.vue'

const props = defineProps({
  text: { type: String, required: true },
  size: { type: String, default: 'md' } // 'sm' | 'md' | 'lg'
})

const store = useWordStore()
const speaking = ref(false)
const supported = isTTSSupported()

async function play() {
  if (speaking.value) return
  speaking.value = true
  try {
    await speak(props.text, store.settings.ttsSpeed)
  } catch {
    // silently fail
  }
  speaking.value = false
}
</script>

<template>
  <button
    v-if="supported"
    class="audio-btn"
    :class="[`audio-btn--${size}`, { 'audio-btn--speaking': speaking }]"
    @click.stop="play"
    :disabled="speaking"
    :title="speaking ? 'Playing...' : 'Listen'"
  >
    <span class="audio-btn-icon">
      <AppIcon :name="speaking ? 'volume-high' : 'volume'" :size="size === 'lg' ? 22 : size === 'sm' ? 14 : 18" />
    </span>
  </button>
  <span v-else class="audio-unsupported" title="TTS not supported in this browser">
    <AppIcon name="volume" :size="16" />
  </span>
</template>

<style scoped>
.audio-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--r-full);
  transition: all var(--t-fast);
  -webkit-tap-highlight-color: transparent;
  background: var(--c-primary-glow);
  border: none;
  cursor: pointer;
}

.audio-btn--sm {
  width: 32px;
  height: 32px;
  font-size: 0.9rem;
}
.audio-btn--md {
  width: 40px;
  height: 40px;
  font-size: 1.1rem;
}
.audio-btn--lg {
  width: 52px;
  height: 52px;
  font-size: 1.4rem;
}

.audio-btn:hover:not(:disabled) {
  background: var(--c-primary);
  transform: scale(1.05);
}
.audio-btn:hover:not(:disabled) .audio-btn-icon {
  opacity: 0.95;
}

.audio-btn--speaking {
  animation: pulse-audio 0.8s ease-in-out infinite;
  background: var(--c-primary);
}

.audio-unsupported {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: 0.4;
  cursor: not-allowed;
}

@keyframes pulse-audio {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}
</style>

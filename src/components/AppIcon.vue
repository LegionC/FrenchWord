<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: Number, default: 18 },
  strokeWidth: { type: Number, default: 1.8 }
})

const paths = computed(() => {
  switch (props.name) {
    case 'cards':
      return [
        'M5 4h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
        'M7 2h12a2 2 0 0 1 2 2v10'
      ]
    case 'quiz':
      return [
        'M3 21h6',
        'M15 3a2.5 2.5 0 1 1 3.5 3.5L8 17l-4 1 1-4 10-10.5z'
      ]
    case 'stats':
      return [
        'M4 20V10',
        'M10 20V4',
        'M16 20v-7',
        'M22 20V8'
      ]
    case 'settings':
      return [
        'M12 3v2',
        'M12 19v2',
        'M4.9 4.9l1.4 1.4',
        'M17.7 17.7l1.4 1.4',
        'M3 12h2',
        'M19 12h2',
        'M4.9 19.1l1.4-1.4',
        'M17.7 6.3l1.4-1.4',
        'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'
      ]
    case 'warning':
      return [
        'M10.3 3.9 1.8 18.5a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
        'M12 9v4',
        'M12 17h.01'
      ]
    case 'volume':
      return [
        'M11 5 6 9H3v6h3l5 4V5z',
        'M15.5 8.5a5 5 0 0 1 0 7'
      ]
    case 'volume-high':
      return [
        'M11 5 6 9H3v6h3l5 4V5z',
        'M15.5 8.5a5 5 0 0 1 0 7',
        'M18.5 6a9 9 0 0 1 0 12'
      ]
    default:
      return []
  }
})
</script>

<template>
  <svg
    class="app-icon"
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    :stroke-width="strokeWidth"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path v-for="(d, i) in paths" :key="i" :d="d" />
  </svg>
</template>

<style scoped>
.app-icon {
  display: block;
}
</style>

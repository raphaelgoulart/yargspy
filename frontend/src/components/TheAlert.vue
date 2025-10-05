<template>
  <div class="p-4 mb-4 text-sm rounded-lg bg-gray-800" :class="getColor" role="alert">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  color: {
    type: String,
    default: 'blue',
  },
})

const getColor = computed(() => {
  switch (props.color) {
    case 'red':
      return ['text-red-400']
    case 'green':
      return ['text-green-400']
    case 'yellow':
      return ['text-yellow-300']
    case 'dark':
      return ['text-gray-300']
    default:
      return ['text-blue-400']
  }
})
</script>

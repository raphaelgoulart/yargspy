<template>
  <div class="px-2 py-1 text-base font-semibold rounded-lg text-white" :class="getColor" role="badge">
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
      return ['bg-red-700']
    case 'green':
      return ['bg-green-600']
    case 'yellow':
      return ['bg-yellow-500']
    case 'dark':
      return ['bg-gray-500']
    default:
      return ['bg-blue-600']
  }
})
</script>

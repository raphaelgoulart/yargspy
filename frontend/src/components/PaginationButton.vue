<template>
  <button
    class="w-12 text-center rounded-md transition duration-150 ease-in-out px-3.5 py-2.5 text-sm"
    :class="getClasses"
    @click="buttonClick"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  active: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['clicked'])

const getClasses = computed(() => {
  if (props.disabled) return 'text-slate-600'
  if (props.active) return 'text-white font-semibold'
  return 'hover:cursor-pointer text-slate-300 hover:bg-gray-700 focus-visible:outline-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2'
})
function buttonClick() {
  if (!props.disabled && !props.active) emit('clicked')
}
</script>

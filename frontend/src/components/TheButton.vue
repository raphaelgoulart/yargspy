<template>
  <button
    :to="to"
    class="hover:cursor-pointer disabled:cursor-not-allowed rounded-md transition duration-150 ease-in-out px-3.5 py-2.5 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2"
    :class="getColor"
    @click="handleClick"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  to: {
    type: String
  },
  color: {
    type: String,
    default: 'blue',
  },
})

const router = useRouter()
function handleClick() {
  if (props.to) router.push(props.to)
}

const getColor = computed(() => {
  switch (props.color) {
    case 'red':
      return ['bg-red-600', 'hover:bg-red-700', 'focus-visible:outline-red-500', 'disabled:bg-red-400']
    case 'green':
      return ['bg-green-600', 'hover:bg-green-700', 'focus-visible:outline-green-500', 'disabled:bg-green-400']
    case 'yellow':
      return ['bg-yellow-600', 'hover:bg-yellow-700', 'focus-visible:outline-yellow-500', 'disabled:bg-yellow-400']
    case 'dark':
      return ['bg-gray-600', 'hover:bg-gray-700', 'focus-visible:outline-gray-500', 'disabled:bg-gray-400']
    default:
      return ['bg-blue-600', 'hover:bg-blue-700', 'focus-visible:outline-blue-500', 'disabled:bg-blue-400']
  }
})
</script>

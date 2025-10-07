<template>
  <li class="me-2">
    <span class="inline-block px-4 pb-4 rounded-t-lg"
      :class="label ? '' : disabled ? 'cursor-not-allowed text-gray-500' : active ? 'text-blue-500 border-blue-500 border-b-2' : 'border-b-2 hover:cursor-pointer hover:border-gray-300 hover:text-white border-transparent'"><slot></slot></span>
  </li>
</template>

<script setup lang="ts">
defineProps({
  active: {type: Boolean, default: false},
  disabled: {type: Boolean, default: false},
  label: {type: Boolean, default: false}
})
</script>

<template>
  <span v-if="modifiers.length">{{ joinModifiers }}</span>
  <i v-else class="text-gray-400">None</i>
</template>

<script setup lang="ts">
import { getModifier } from '@/plugins/utils'
import { computed } from 'vue'

const props = defineProps({
  modifiers: {type: Array<number>, required: true}
})
const joinModifiers = computed((): string => {
  const arr = []
  for (const m in props.modifiers) {
      arr.push(getModifier(props.modifiers[m]!))
  }
  return arr.join(", ")
})
</script>

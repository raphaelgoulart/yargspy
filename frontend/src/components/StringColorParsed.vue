<template>
  <span
    v-for="(item, i) in parseColorTags(value)"
    :key="i"
    :style="{ color: item.color ? item.color : 'inherit' }"
    >{{ item.item }}</span
  >
</template>

<script setup lang="ts">
import { parseColorTags } from '@/plugins/utils'

defineProps({
  value: { type: String, required: true },
})
</script>

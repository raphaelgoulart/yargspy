<script setup lang="ts">
import { percent } from '@/plugins/utils'

defineProps({
  n: { type: Number, required: true },
  overhits: Number,
})
</script>

<template>
  <span v-if="n == 1 && !overhits" class="text-yellow-300 font-semibold">👑FC</span>
  <span v-else>{{ percent(n) }}</span>
</template>

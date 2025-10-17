<template>
  <TheModal :open="open" @close="$emit('close')"> </TheModal>
</template>

<script setup lang="ts">
import type { IScore } from '@/plugins/types'
import TheModal from './TheModal.vue'
import { ref, type PropType } from 'vue'

const open = ref(false)
defineProps({
  score: { type: Object as PropType<IScore>, required: true },
  username: { type: String, required: true },
  songName: { type: String, required: true },
  songArtist: { type: String, required: true },
})
</script>

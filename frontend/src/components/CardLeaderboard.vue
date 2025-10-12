<template>
  <RouterLink :to="to">
    <div
      class="w-full rounded overflow-hidden shadow-lg flex border bg-gray-800 border-gray-700 h-28 transition-scale duration-200 hover:scale-103 hover:bg-gray-700"
    >
      <img class="w-28 object-cover" :src="imgSrc" :alt="album ?? 'Album Cover'" />
      <div class="px-6 flex flex-col my-auto text-left">
        <span class="font-bold text-lg/5">{{ name }}</span>
        <p class="text-sm my-1 text-slate-300"><StringColorParsed :value="artist" /></p>
        <p v-if="charter" class="text-xs text-slate-300"><StringColorParsed :value="charter" /></p>
      </div>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { albumArtFinder } from '@/plugins/albumArtFinder'
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import StringColorParsed from './StringColorParsed.vue'
import defaultSongImg from '../assets/img/song.png'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  artist: {
    type: String,
    required: true,
  },
  charter: {
    type: String,
  },
  id: {
    type: String,
    required: true,
  },
  album: String,
})

const to = { name: 'leaderboard', params: { id: props.id } }
const imgSrc = ref(defaultSongImg)

onMounted(async () => {
  const result = await albumArtFinder(props.artist, props.album)
  if (result && result.data) {
    if (result.data.album.image[2]['#text']) imgSrc.value = result.data.album.image[2]['#text']
  }
})
</script>

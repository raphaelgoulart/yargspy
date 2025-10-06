<template>
  <div class="hidden sm:block">
    <img class="w-5 inline" v-for="n in 5" :key="n" :src="imgToRender(n)" />
  </div>
  <div class="sm:hidden">
    <img class="w-5" v-if="roundedStars == 6" :src="src[2]" />
    <img class="w-5" v-else-if="roundedStars == 0" :src="src[0]" />
    <span v-else>{{ roundedStars }}
      <img class="w-5 inline" :src="src[1]" />
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  stars: {type: Number, required: true, min: 0, max: 6}
})

const src = ['/src/assets/img/StarProgressEmpty.png','/src/assets/img/StarStandard.png','/src/assets/img/StarGold.png']
const roundedStars = computed((): number => Math.floor(props.stars))
const imgToRender = (n: number): string => {
  if (roundedStars.value == 6) return src[2]!
  return src[n <= roundedStars.value ? 1 : 0]!
}
</script>

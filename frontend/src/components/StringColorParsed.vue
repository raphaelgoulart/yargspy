<template>
  <span
    v-for="(item, i) in parseColorTags"
    :key="i"
    :style="{ color: item.color ? item.color : 'inherit' }"
    >{{ item.item }}</span
  >
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  value: { type: String, required: true },
})

const parseColorTags = computed((): { item: string | undefined; color: string | undefined }[] => {
  const split = props.value.split(/(<color="?#\w\w\w\w\w\w"?>)|(<\/color>)/)
  const out = []
  let currentColor = undefined
  let currentItem = undefined
  const inPattern = /<color="?(#\w\w\w\w\w\w)"?>/
  const outPattern = /<\/color>/
  for (const i in split) {
    const item = split[i]
    if (!item) continue
    const match = item.match(inPattern)
    if (match) {
      currentColor = match[1]
    } else if (outPattern.test(item)) {
      out.push({
        item: currentItem,
        color: currentColor,
      })
      currentItem = undefined
      currentColor = undefined
    } else {
      if (currentColor) currentItem = item
      else
        out.push({
          item: item,
          color: undefined,
        })
    }
  }
  return out
})
</script>

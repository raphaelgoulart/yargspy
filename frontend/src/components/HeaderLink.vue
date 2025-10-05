<template>
  <span @click="handleClick" class="hover:cursor-pointer" :class="getClasses"><slot></slot></span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps({
  to: {
    type: String,
  },
  mobile: {
    type: Boolean,
    default: false,
  },
})
const router = useRouter()

function handleClick () {
  if (props.to) router.push(props.to)
}

const getClasses = computed(() => {
  const classes = props.mobile
    ? [
        '-mx-3',
        'block',
        'rounded-lg',
        'px-3',
        'py-2',
        'text-base/7',
        'font-semibold',
        'hover:bg-white/5',
      ]
    : ['text-sm/6', 'font-semibold', 'hover:text-slate-300']
  classes.push(route.path == props.to ? 'text-slate-300' : 'text-white')
  return classes
})

const route = useRoute()
</script>

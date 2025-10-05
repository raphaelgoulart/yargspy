<template>
  <div
    class="card-player w-48 max-w-9/10 m-2 border rounded-lg shadow-sm bg-gray-800 border-gray-700 inline-block transition-scale duration-200 hover:scale-103 hover:bg-gray-700"
  >
    <RouterLink :to="to">
      <img class="rounded-t-lg w-48" :src="profilePhotoUrl" alt="" />
    </RouterLink>
    <div class="p-4 text-center">
      <RouterLink :to="to">
        <span class="mb-2 text-xl font-semibold tracking-tight text-slate-300">
          {{ username }}
        </span>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  username: {
    type: String,
    required: true,
  },
  profilePhotoUrl: {
    type: String,
    default: '/src/assets/img/avatar.jpg',
  },
})

const to = `player/${props.username}`
</script>

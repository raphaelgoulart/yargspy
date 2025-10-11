<template>
  <div
    class="card-player w-48 max-w-9/10 m-2 border rounded-lg shadow-sm bg-gray-800 border-gray-700 inline-block transition-scale duration-200 hover:scale-103 hover:bg-gray-700"
  >
    <RouterLink :to="to">
      <img class="rounded-t-lg w-48 h-48 object-cover" :src="profilePhotoUrl" alt="" />
    </RouterLink>
    <div class="py-4 text-center">
      <RouterLink :to="to">
        <span
          class="inline-flex items-center gap-1 text-xl font-semibold tracking-tight text-slate-300"
        >
          <CountryFlag :code="country" :size="3" />
          {{ username }}
        </span>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import CountryFlag from './CountryFlag.vue'
import defaultProfilePhoto from '../assets/img/avatar.jpg'

const props = defineProps({
  username: {
    type: String,
    required: true,
  },
  profilePhotoUrl: {
    type: String,
    default: defaultProfilePhoto,
  },
  country: {
    type: String,
    default: 'xx',
  },
})

const to = { name: 'player', params: { username: props.username } }
</script>

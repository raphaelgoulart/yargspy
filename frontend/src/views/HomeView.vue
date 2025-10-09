<template>
  <div class="flex h-screen text-center home-box">
    <Transition
      appear
      enter-active-class="transition duration-1000 ease-out"
      enter-from-class="opacity-0 -translate-y-6"
      enter-to-class="opacity-100 translate-y-0"
    >
      <div class="m-auto">
        <img class="w-lg mx-auto" src="/src/assets/img/yargspy-R.png" />
        <p class="mt-3 font-medium text-pretty text-gray-400 sm:text-lg/8">
          Unofficial replay-validation-based leaderboards for
          <a href="https://yarg.in/">YARG</a> (Yet Another Rhythm Game)
        </p>
        <TheAlert class="mt-4" color="yellow"
          ><ExclamationTriangleIcon class="w-5 inline" /> This website is still in development; some
          functionality might be broken or outright non-existent.</TheAlert
        >
        <h1 class="font-bold text-5xl pb-8">GET STARTED</h1>
        <div class="flex items-center justify-center gap-x-3" v-if="!auth.user">
          <TheButton to="/login">Log in</TheButton>
          <TheButton to="/register">Register</TheButton>
        </div>
        <TheButton to="/upload" v-else>Upload REPLAY File</TheButton>
        <div class="flex items-center justify-center gap-x-3"></div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import TheAlert from '@/components/TheAlert.vue'
import TheButton from '@/components/TheButton.vue'
import { ExclamationTriangleIcon } from '@heroicons/vue/20/solid'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<style scoped>
.home-box {
  background-image: url('https://yarg.in/gradient.webp');
  background-size: cover;
  mask-image: url('/src/assets/img/alphamask.png');
  mask-mode: alpha;
  mask-size: cover;
  -webkit-mask-image: url('/src/assets/img/alphamask.png');
  -webkit-mask-mode: alpha;
  -webkit-mask-size: cover;
}
</style>

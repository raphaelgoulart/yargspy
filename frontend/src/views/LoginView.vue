<template>
  <h1 class="text-center text-4xl font-bold mb-8">LOG IN</h1>
  <div class="flex justify-center">
    <div class="w-full sm:w-128 p-4 pb-2 sm:border rounded-md border-gray-800">
      <LoginForm @register="router.push('/register')" @forgotPassword="router.push('/passwordReset')" @login="redirect" />
    </div>
  </div>
</template>

<script setup lang="ts">
import LoginForm from '@/components/LoginForm.vue';
import { useAuthStore } from '@/stores/auth';
import { onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const auth = useAuthStore();

function redirect(){
  if (auth.returnUrl) {
    router.push(auth.returnUrl)
  } else {
    router.push('/')
  }
}
const router = useRouter()
onUnmounted(() => auth.returnUrl = null) // clean return URL if user leaves this page
</script>

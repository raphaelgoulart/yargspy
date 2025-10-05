<template>
  <h1 class="text-center text-4xl font-bold mb-8">FORGOT YOUR PASSWORD?</h1>
  <div class="flex justify-center">
    <div class="w-full sm:w-128 p-4 pb-2 sm:border rounded-md border-gray-800">
      <PasswordForgotForm @register="router.push('/register')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import PasswordForgotForm from '@/components/PasswordForgotForm.vue';
import { useRouter } from 'vue-router';

const router = useRouter()
</script>

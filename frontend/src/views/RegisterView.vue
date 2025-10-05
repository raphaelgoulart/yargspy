<template>
  <h1 class="text-center text-4xl font-bold mb-8">REGISTER</h1>
  <div class="flex justify-center">
    <div class="w-full sm:w-128 p-4 pb-2 sm:border rounded-md border-gray-800">
      <RegisterForm @register="router.push('/login')" @login="router.push('/login')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import RegisterForm from '@/components/RegisterForm.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

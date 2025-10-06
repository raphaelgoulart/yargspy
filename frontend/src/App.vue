<script setup lang="ts">
import { RouterView } from 'vue-router'
import TheHeader from './components/TheHeader.vue'
import { Toaster } from 'vue-sonner';
import 'vue-sonner/style.css'
</script>

<template>
  <Toaster richColors theme="dark" position="top-right" closeButton closeButtonPosition="top-right" :toastOptions="{
    style: { 'font-family': 'var(--body-font)' },
  }" />
  <div class="min-h-screen bg-gray-900">
    <TheHeader />
    <div class="text-slate-300">
      <RouterView :key="$route.fullPath" />
    </div>
  </div>
</template>

<template>
  <form ref="form">
    <div>
      <div class="mb-4">
        <FormInput name="email" label="Email" v-model="email" type="email" required>
          <div class="text-gray-500 pr-1.5 pl-0.5"><EnvelopeIcon class="size-4" aria-hidden="true" /></div>
        </FormInput>
      </div>
      <div class="mb-4 flex justify-center">
        <VueHcaptcha :sitekey="hCaptchaSiteKey" class="border-gray-700"></VueHcaptcha>
      </div>
      <div class="mb-2 flex justify-between">
        <TheButton type="submit" @click="resetPassword" :disabled="loading">Reset Password</TheButton>
        <div class="text-xs">Don't have an account? <span class="text-white font-semibold hover:cursor-pointer inline-block transition-all duration-300 hover:scale-105" @click="$emit('register')">Register</span></div>
      </div>
      <TheAlert v-if="error" color='red' class="text-center">
        <div>
          <ExclamationCircleIcon class="size-5 inline" />
          <span class="align-middle ml-1">{{ error }}</span>
        </div>
      </TheAlert>
      <LoadingSpinner no-text v-if="loading" class="text-center mb-2" />
    </div>
  </form>
</template>

<script setup lang="ts">
import FormInput from './FormInput.vue';
import { EnvelopeIcon, ExclamationCircleIcon } from '@heroicons/vue/20/solid';
import VueHcaptcha from '@hcaptcha/vue3-hcaptcha';
import TheButton from './TheButton.vue';
import TheAlert from './TheAlert.vue';
import LoadingSpinner from './LoadingSpinner.vue';

import { ref } from 'vue';
import api from '@/plugins/axios';
import axios from 'axios';
import { toast } from 'vue-sonner';

const hCaptchaSiteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY
const form = ref()
const email = ref('')
const loading = ref(false)
const error = ref('')

async function resetPassword(ev: Event){
  ev.preventDefault()
  if (!form.value.reportValidity()) return
  const formData = new FormData(form.value);
  if (!formData.get('h-captcha-response')) {
    error.value = 'Please fill out the captcha.'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await api.post('/user/passwordForgot', formData)
    toast.success('If this email belongs to an account, a password reset link will be sent shortly.')
  } catch (e) {
    if (axios.isAxiosError(e) && e.status! < 500) {
      error.value = e.response?.data.message
    } else {
      console.log(e)
      error.value = 'An unknown error has occurred.'
    }
  } finally {
    loading.value = false
  }
}
</script>

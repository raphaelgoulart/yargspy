<template>
  <form ref="form">
    <div>
      <div class="mb-4">
        <FormInput name="username" label="Username" v-model="username" autocomplete='username' required minlength="3" maxlength="32">
          <div class="text-gray-500 pr-1"><UserIcon class="size-5" aria-hidden="true" /></div>
        </FormInput>
      </div>
      <div class="mb-2">
        <FormInput name="email" label="Email" v-model="email" type="email" required>
          <div class="text-gray-500 pr-1.5 pl-0.5"><EnvelopeIcon class="size-4" aria-hidden="true" /></div>
        </FormInput>
      </div>
      <div class="mb-2">
        <FormInput name="password" label="Password" v-model="password" autocomplete='current-password' type="password" required minlength="8" maxlength="48">
          <div class="text-gray-500 pl-0.5 pr-1.5"><LockClosedIcon class="size-4" aria-hidden="true" /></div>
        </FormInput>
      </div>
      <div class="mb-2">
        <FormInput name="passwordConfirm" label="Confirm password" v-model="passwordConfirm" type="password" required minlength="8" maxlength="48">
          <div class="text-gray-500 pl-0.5 pr-1.5"><LockClosedIcon class="size-4" aria-hidden="true" /></div>
        </FormInput>
      </div>
      <div class="mb-2 flex justify-center">
        <VueHcaptcha :sitekey="hCaptchaSiteKey" class="border-gray-700"></VueHcaptcha>
      </div>
      <div class="mb-2 flex justify-between">
        <TheButton type="submit" @click="register" :disabled="loading">Register</TheButton>
        <div class="text-xs">Already have an account? <span class="text-white font-semibold hover:cursor-pointer inline-block transition-all duration-300 hover:scale-105" @click="$emit('login')">Log in</span></div>
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
import TheButton from './TheButton.vue';
import TheAlert from './TheAlert.vue';
import { ref } from 'vue';
import { UserIcon, EnvelopeIcon, LockClosedIcon, ExclamationCircleIcon } from '@heroicons/vue/20/solid';
import VueHcaptcha from '@hcaptcha/vue3-hcaptcha';
import LoadingSpinner from './LoadingSpinner.vue';
import { toast } from 'vue-sonner';
import axios from 'axios';
import api from '@/plugins/axios';

const hCaptchaSiteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY
const form = ref()
const username = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')

const loading = ref(false)
const error = ref('')
const emit = defineEmits(['login', 'register'])

async function register(ev: Event){
  ev.preventDefault()
  if (!form.value.reportValidity()) return
  if (password.value != passwordConfirm.value) {
    error.value = 'Both passwords must match.'
    return
  }
  const formData = new FormData(form.value);
  if (!formData.get('h-captcha-response')) {
    error.value = 'Please fill out the captcha.'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await api.post('/user/register', formData)
    toast.success('Account created successfully! Please verify your email to activate it')
    emit('register')
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

<template>
  <form ref="form">
    <div>
      <div class="mb-4">
        <FormInput name="username" label="Username" v-model="username" autocomplete='username' required minlength="3" maxlength="32">
          <div class="text-gray-500 pr-1"><UserIcon class="size-5" aria-hidden="true" /></div>
        </FormInput>
      </div>
      <div class="mb-2">
        <FormInput name="password" label="Password" v-model="password" autocomplete='current-password' type="password" required minlength="8" maxlength="48">
          <div class="text-gray-500 pl-0.5 pr-1.5"><LockClosedIcon class="size-4" aria-hidden="true" /></div>
        </FormInput>
      </div>
      <div class="flex justify-between">
        <div>
          <TheButton type="submit" @click="login" :disabled="loading">Log in</TheButton>
        </div>
        <div class="text-xs text-right text-white font-semibold hover:cursor-pointer mb-2"
        @click="$emit('forgotPassword')"><span class="inline-block transition-all duration-300 hover:scale-105">Forgot your password?</span></div>
      </div>
      <div class="text-xs my-2">Don't have an account? <span class="text-white font-semibold hover:cursor-pointer inline-block transition-all duration-300 hover:scale-105" @click="$emit('register')">Register</span></div>
      <TheAlert v-if="error" :color="emailVerification ? 'yellow' : 'red'" class="text-center">
        <div v-if="emailVerification">
          <ExclamationTriangleIcon class="size-5 inline" />
          This account's email is not verified yet.<br />Didn't receive the email?
          <a class="hover:cursor-pointer" @click="resend">Click here</a> to resend it.
        </div>
        <div v-else>
          <ExclamationCircleIcon class="size-5 inline" />
          <span class="align-middle ml-1">{{ error }}</span>
        </div>
      </TheAlert>
      <LoadingSpinner no-text v-if="loading" class="text-center mb-2" />
    </div>
  </form>
</template>

<script setup lang="ts">
import { LockClosedIcon, UserIcon, ExclamationCircleIcon, ExclamationTriangleIcon } from '@heroicons/vue/20/solid';
import TheButton from './TheButton.vue';
import TheAlert from './TheAlert.vue';
import { ref } from 'vue';
import { toast } from 'vue-sonner';
import axios from 'axios';
import api from '@/plugins/axios';
import LoadingSpinner from './LoadingSpinner.vue';
import { useAuthStore } from '@/stores/auth';
import FormInput from './FormInput.vue';

const auth = useAuthStore();

const form = ref()
const username = ref('')
const password = ref('')

const loading = ref(false)
const error = ref('')
const emailVerification = ref(false)
const emit = defineEmits(['login', 'register', 'forgotPassword'])

if (auth.user) {
  toast.warning("You're already logged in!")
  emit('login')
}

async function login(ev: Event) {
  ev.preventDefault()
  if (!form.value.reportValidity()) return
  loading.value = true
  error.value = ''
  emailVerification.value = false
  const params = {
    username: username.value,
    password: password.value
  }
  try {
    const result = await api.post('/user/login', params)
    const token = result.data.token
    await auth.login(token)
    toast.success('Logged in successfully!')
    emit('login')
  } catch (e) {
    if (axios.isAxiosError(e) && e.status! < 500) {
      if (e.response?.data.code == "err_login_user_email_unverified") {
        error.value = params.username
        emailVerification.value = true
      } else if (e.response?.data.code == 'err_login_user_inactive') {
        error.value = e.response?.data.message
      } else {
        error.value = "Wrong username or password"
      }
    } else {
      console.log(e)
      error.value = 'An unknown error has occurred.'
    }
  } finally {
    loading.value = false
  }

}
async function resend() {
  loading.value = true
  try {
    await api.post('/user/emailResend', { username: error.value})
    error.value = ''
    toast.success('Verification email sent successfully.')
  } catch (e) {
    if (axios.isAxiosError(e) && e.status! < 500) {
      toast.error(e.response?.data.message)
    } else {
      console.log(e)
      toast.error('An unknown error has occurred.')
    }
  } finally {
    loading.value = false
  }
}
</script>

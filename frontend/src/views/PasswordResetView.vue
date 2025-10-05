<template>
  <h1 class="text-center text-4xl font-bold mb-8">PASSWORD RESET</h1>
  <div class="flex justify-center">
    <div class="w-full sm:w-128 p-4 pb-2 sm:border rounded-md border-gray-800">
      <form ref="form">
        <div>
          <div class="mb-4">
            <FormInput name="password" label="New password" v-model="password" type="password" required minlength="8" maxlength="48">
              <div class="text-gray-500 pl-0.5 pr-1.5"><LockClosedIcon class="size-4" aria-hidden="true" /></div>
            </FormInput>
          </div>
          <div class="mb-4">
            <FormInput name="passwordConfirm" label="Confirm password" v-model="passwordConfirm" type="password" required minlength="8" maxlength="48">
              <div class="text-gray-500 pl-0.5 pr-1.5"><LockClosedIcon class="size-4" aria-hidden="true" /></div>
            </FormInput>
          </div>
          <div class="mb-4 flex justify-center">
            <VueHcaptcha :sitekey="hCaptchaSiteKey" class="border-gray-700"></VueHcaptcha>
          </div>
          <TheButton type="submit" @click="resetPassword" :disabled="loading" class="mb-2">Reset Password</TheButton>
          <TheAlert v-if="error" color='red' class="text-center">
            <div>
              <ExclamationCircleIcon class="size-5 inline" />
              <span class="align-middle ml-1">{{ error }}</span>
            </div>
          </TheAlert>
          <LoadingSpinner no-text v-if="loading" class="text-center mb-2" />
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import FormInput from '@/components/FormInput.vue';
import TheButton from '@/components/TheButton.vue';
import TheAlert from '@/components/TheAlert.vue';
import VueHcaptcha from '@hcaptcha/vue3-hcaptcha';
import { ref } from 'vue';
import api from '@/plugins/axios';
import { toast } from 'vue-sonner';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const hCaptchaSiteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY
const form = ref()
const password = ref('')
const passwordConfirm = ref('')

const loading = ref(false)
const error = ref('')

const route = useRoute();
const router = useRouter()

async function resetPassword(ev: Event){
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
  formData.append('token', route.params.token as string)
  loading.value = true
  error.value = ''
  try {
    await api.post('/user/passwordReset', formData)
    toast.success('Password reset successfully!')
    router.push('/login')
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

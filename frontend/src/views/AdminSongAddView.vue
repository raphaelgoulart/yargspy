<template>
  <h1 class="text-center text-4xl font-bold mb-8">ADD SONG</h1>
  <div class="flex justify-center">
    <TheAlert class="w-full sm:w-128 justify-center text-center"
      ><ExclamationCircleIcon class="size-5 inline" /><span class="align-middle ml-1"
        >This should be used only for cases where the player is unable to get the original song
        files (i.e. official YARG songs).</span
      ></TheAlert
    >
  </div>
  <div class="flex justify-center">
    <div class="w-full sm:w-128 p-4 pb-2 sm:border rounded-md border-gray-800">
      <form ref="form" class="mb-2">
        <div class="mb-4">
          <FormInputFile
            name="chartFile"
            label="notes.mid/notes.chart file"
            required
            accept=".mid,.chart"
          />
        </div>
        <div class="mb-2">
          <FormInputFile
            name="songDataFile"
            label="song.ini/.dta file"
            required
            accept=".ini,.dta"
          />
        </div>
        <TheAlert class="w-full text-center mt-4" v-if="!loading && !error"
          ><ExclamationCircleIcon class="size-5 inline" /><span class="align-middle ml-1"
            >If uploading a <b>.dta</b> file, make sure the only entry in it is the song you're
            submitting; otherwise, the wrong data may be fetched.</span
          ></TheAlert
        >
        <TheButton type="submit" @click="upload" :disabled="loading">Submit</TheButton>
      </form>
      <TheAlert v-if="error" color="red" class="text-center">
        <div>
          <ExclamationCircleIcon class="size-5 inline" />
          <span class="align-middle ml-1">{{ error }}</span>
        </div>
      </TheAlert>
      <LoadingSpinner no-text v-if="loading" class="text-center mb-2" />
    </div>
  </div>
</template>

<script setup lang="ts">
import TheAlert from '@/components/TheAlert.vue'
import TheButton from '@/components/TheButton.vue'
import FormInputFile from '@/components/FormInputFile.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { ExclamationCircleIcon } from '@heroicons/vue/20/solid'
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import axios from 'axios'
import api from '@/plugins/axios'
import { useRouter } from 'vue-router'

const loading = ref(false)
const error = ref('')
const form = ref()
const router = useRouter()

async function upload(ev: Event) {
  ev.preventDefault()
  if (!form.value.reportValidity()) return
  const formData = new FormData(form.value)
  loading.value = true
  error.value = ''
  try {
    const result = await api.post('/admin/songAdd', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    toast.success(result.data.message)
    router.push('/leaderboard/' + result.data.song._id)
  } catch (e) {
    if (axios.isAxiosError(e) && e.status! < 500) {
      if (e.response?.data.code == 'err_validator_unknown') {
        error.value = e.response?.data.error
      } else {
        error.value = e.response?.data.message
      }
    } else {
      console.log(e)
      error.value = 'An unknown error has occurred.'
    }
    loading.value = false
  }
}
</script>

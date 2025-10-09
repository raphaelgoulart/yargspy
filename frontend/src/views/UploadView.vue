<template>
  <h1 class="text-center text-4xl font-bold mb-8">UPLOAD REPLAY FILE</h1>
  <div class="flex justify-center">
    <TheAlert class="w-full sm:w-128 justify-center"
      ><ExclamationCircleIcon class="size-5 inline" /><span class="align-middle ml-1"
        >Only replay files from the latest <b>Stable</b> version are supported.</span
      ></TheAlert
    >
  </div>
  <div class="flex justify-center">
    <div class="w-full sm:w-128 p-4 pb-2 sm:border rounded-md border-gray-800">
      <form ref="form" class="mb-2">
        <div class="mb-2">
          <FormInputFile name="replayFile" label="Choose .replay file" required accept=".replay" />
        </div>
        <div v-if="songDataRequired">
          <TheAlert color="yellow" class="text-center mt-4">
            <div>
              <ExclamationTriangleIcon class="size-5 inline" />
              <span class="align-middle ml-1"
                ><b>WARNING:</b> This song isn't available on our database yet, so<br />we need some
                more information for replay validation purposes.</span
              >
            </div>
          </TheAlert>
          <div class="mb-4">
            <FormInputFile
              name="chartFile"
              label="notes.mid/notes.chart file"
              :required="songDataRequired"
              :disabled="!songDataRequired"
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
        </div>
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
import FormInputFile from '@/components/FormInputFile.vue'
import TheButton from '@/components/TheButton.vue'
import TheAlert from '@/components/TheAlert.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { ExclamationCircleIcon, ExclamationTriangleIcon } from '@heroicons/vue/20/solid'
import { ref } from 'vue'
import axios from 'axios'
import api from '@/plugins/axios'
import { toast } from 'vue-sonner'
import { useRouter } from 'vue-router'

const form = ref()
const songDataRequired = ref(false)

const loading = ref(false)
const error = ref('')

const router = useRouter()

async function upload(ev: Event) {
  ev.preventDefault()
  if (!form.value.reportValidity()) return
  const formData = new FormData(form.value)
  formData.append('reqType', songDataRequired.value ? 'complete' : 'replayOnly')
  if (!songDataRequired.value) {
    formData.delete('chartFile')
    formData.delete('songDataFile')
  }
  loading.value = true
  error.value = ''
  try {
    const result = await api.post('/replay/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    toast.success(result.data.message)
    router.push('/leaderboard/' + result.data.song)
  } catch (e) {
    if (axios.isAxiosError(e) && e.status! < 500) {
      if (e.response?.data.code == 'err_replay_songdata_required') {
        songDataRequired.value = true
      } else {
        error.value = e.response?.data.message
      }
    } else {
      console.log(e)
      error.value = 'An unknown error has occurred.'
    }
  } finally {
    loading.value = false
  }
}
</script>

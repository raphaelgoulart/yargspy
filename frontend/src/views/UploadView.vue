<template>
  <h1 class="text-center text-4xl font-bold mb-8">UPLOAD REPLAY FILE</h1>
  <div class="flex justify-center">
    <TheAlert class="w-full sm:w-128 justify-center"
      ><ExclamationCircleIcon class="size-5 inline" /><span class="align-middle ml-1"
        >Only replay files from the latest <b>Stable</b> version are supported.<br />Only built-in
        engine presets (default, casual, precision) are supported.</span
      ></TheAlert
    >
  </div>
  <div class="flex justify-center">
    <TheAlert class="w-full sm:w-128 justify-center" color="yellow"
      ><ExclamationTriangleIcon class="size-5 inline" /><span class="align-middle ml-1"
        ><b>Co-op replays are not supported at the present moment, </b>since it isn't possible to
        differentiate play-with-replay runs from actual co-op runs yet. We apologize for the
        inconvenience.</span
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
          <TheAlert class="w-full text-center mt-4" v-if="!loading && !error"
            ><ExclamationCircleIcon class="size-5 inline" /><span class="align-middle ml-1"
              >If uploading a <b>.dta</b> file, make sure the only entry in it is the song you're
              submitting; otherwise, the wrong data may be fetched.</span
            ></TheAlert
          >
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
      } else if (e.response?.data.code == 'err_validator_unknown') {
        error.value = e.response?.data.error
      } else {
        if (e.response?.data.code == 'err_replay_register_no_reqtype')
          console.log(Object.fromEntries(e.config?.data))
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

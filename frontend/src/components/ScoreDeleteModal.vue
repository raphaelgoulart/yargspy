<template>
  <TheModal :open="open" @close="$emit('close')" title="DANGER!">
    <div class="mt-2">
      <form ref="deleteForm">
        <p class="mt-1">
          This will delete the following score in
          <b><StringColorParsed :value="songArtist ?? ''" /></b> - <b>{{ songName }}</b
          ><br />by user <b>{{ username }}</b
          >:
        </p>
        <TheAlert class="text-center">
          <p class="mt-1">
            {{ score?.score.toLocaleString() }} - {{ score?.stars }} stars
            <span v-if="score?.percent">
              - <ScorePercent :n="score.percent" :overhits="score.overhits"
            /></span>
            - {{ percent(score!.songSpeed) }} speed
          </p>
          <p>
            {{ getInstrument(score!.instrument) }}
            <span v-if="score?.difficulty"> - {{ getDifficulty(score.difficulty) }}</span>
            <span v-if="score?.engine"> - {{ getEngine(score.engine) }}</span>
          </p>
        </TheAlert>
        <p class="mt-1">
          <b
            >This action will also delete its associated
            {{ score?.instrument == 255 ? 'instrument scores' : 'band score' }}. IT CANNOT BE
            UNDONE.</b
          >
        </p>
        <p class="mt-1">Are you sure you want to do this?</p>
        <div class="mt-2">
          <FormTextarea v-model="deleteReason" name="reason" label="Reason" required />
        </div>
        <div class="mt-4">
          <TheButton type="submit" color="red" @click="deleteScore" :disabled="deleteLoading"
            >Do it</TheButton
          >
        </div>
        <LoadingSpinner v-if="deleteLoading" class="text-center mt-2" />
        <TheAlert v-if="deleteError" color="red" class="text-center mt-2">
          <div>
            <ExclamationCircleIcon class="size-5 inline" />
            <span class="align-middle ml-1">{{ deleteError }}</span>
          </div>
        </TheAlert>
      </form>
    </div>
  </TheModal>
</template>

<script setup lang="ts">
import type { IScore } from '@/plugins/types'
import TheModal from './TheModal.vue'
import StringColorParsed from './StringColorParsed.vue'
import { ref, type PropType } from 'vue'
import ScorePercent from './ScorePercent.vue'
import { getDifficulty, getEngine, getInstrument, percent } from '@/plugins/utils'
import FormTextarea from './FormTextarea.vue'
import TheButton from './TheButton.vue'
import LoadingSpinner from './LoadingSpinner.vue'
import { ExclamationCircleIcon } from '@heroicons/vue/20/solid'
import TheAlert from './TheAlert.vue'
import api from '@/plugins/axios'
import { toast } from 'vue-sonner'
import axios from 'axios'

const open = ref(false)
const emit = defineEmits(['close', 'delete'])
const props = defineProps({
  score: { type: Object as PropType<IScore> },
  username: { type: String },
  songName: { type: String },
  songArtist: { type: String },
})
const deleteForm = ref()
const deleteReason = ref('')
const deleteLoading = ref(false)
const deleteError = ref('')

async function deleteScore(ev: Event) {
  ev.preventDefault()
  if (!deleteForm.value.reportValidity()) return
  deleteError.value = ''
  deleteLoading.value = true
  try {
    await api.post('/admin/scoreDelete', {
      id: props.score!._id,
      reason: deleteReason.value,
    })
    toast.success('Score deleted succesfully!')
    deleteReason.value = ''
    emit('delete')
    emit('close')
  } catch (e) {
    if (axios.isAxiosError(e) && e.status! < 500) {
      deleteError.value = e.response?.data.message
    } else {
      console.log(e)
      deleteError.value = 'An unknown error has occurred.'
    }
  } finally {
    deleteLoading.value = false
  }
}
</script>

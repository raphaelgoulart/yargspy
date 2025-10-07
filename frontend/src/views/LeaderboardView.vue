<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
    <div class="w-full p-4 pb-2 sm:border rounded-md border-gray-800">
      <p class="mb-5 font-bold text-lg/5 text-white">Song info</p>
      <img :src="imgSrc" class="w-full rounded-md mb-2" />
      <LoadingSpinner v-if="loading" class="text-center" />
      <TheAlert color="red" v-else-if="error" class="text-center"
        ><ExclamationCircleIcon class="size-5 inline" />
        <span class="align-middle ml-1">{{ error }}</span></TheAlert
      >
      <div v-if="song" class="pt-2">
        <h2 class="text-4xl mb-2 font-semibold">{{ song.name }}</h2>
        <p class="text-2xl mb-2">by {{ song.artist }}<span v-if="song.year">, {{ song.year.replace(',','').trim() }}</span></p>
        <p v-if="song.album" class="mb-2">From {{ song.album }}</p>
        <p><b>Charted by: </b>{{ song.charter }}</p>
        <hr class="my-4 text-gray-700" />
        <div v-if="Object.keys(instruments).length">
          <FormDropdown :items="instrumentList" v-model="instrument" class="mb-2" @update:modelValue="setInstrument()" />
          <FormDropdown :items="new Map([...Array(6).keys()].map(i => [i.toString(), getDifficulty(i)]))" class="mb-2" @update:modelValue="setDifficulty()"
            v-model="difficulty" :disabled="instrument == bandString" :availableItems="availableDifficultyList" />
          <TheButton color="blue" @click="allowedModifiersOpen = !allowedModifiersOpen" class="text-center w-full mb-1">Allowed modifiers...</TheButton>
          <Transition
            enter-active-class="transition duration-200 ease-out origin-top"
            enter-from-class="opacity-0 scale-y-0"
            enter-to-class="opacity-100 scale-y-100"
            leave-active-class="transition duration-150 ease-in origin-top"
            leave-from-class="opacity-100 scale-y-100"
            leave-to-class="opacity-0 scale-y-0">
            <div v-if="allowedModifiersOpen">
              <FormCheckbox v-for="(c,i) in allowedModifiersEdit" :key="i" :label="getModifier(Number(i))" :checked="c" v-model="allowedModifiersEdit[i]" />
              <TheButton @click="setAllowedModifiers()" class="text-center w-full mt-1 mb-2">Save</TheButton>
            </div>
          </Transition>
        </div>
      </div>
    </div>
    <div class="col-span-3 w-full p-4 sm:border rounded-md border-gray-800">

    </div>
  </div>
</template>

<script setup lang="ts">
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import TheAlert from '@/components/TheAlert.vue';
import FormDropdown from '@/components/FormDropdown.vue';
import { ExclamationCircleIcon } from '@heroicons/vue/20/solid';
import { albumArtFinder } from '@/plugins/albumArtFinder';
import api from '@/plugins/axios';
import axios from 'axios';
import { computed, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';
import { Difficulty, type ISong } from '@/plugins/types';
import { getInstrument, getDifficulty, getModifier } from '@/plugins/utils';
import TheButton from '@/components/TheButton.vue';
import FormCheckbox from '@/components/FormCheckbox.vue';

const bandString = '255'
const imgSrc = ref('/src/assets/img/song.png')
const route = useRoute()
const allowedModifiersOpen = ref(false)

const loading = ref(true)
const scoreLoading = ref(true)
const error = ref('')
const scoreError = ref('')

const song = ref(null as ISong | null)
const instruments = ref({} as Record<number,Record<number,object>>)
const page = ref(1)
const limit = ref(10)

const instrument = ref(bandString)
const difficulty = ref(Difficulty.Expert.toString())
const engine = ref(0) // Default
const allowedModifiersDefault = {
  0: true,
  1: false,
  2: false,
  3: false,
  4: true,
  5: true,
  6: false,
  7: false,
  8: true,
  9: true,
  10: true
}
const allowedModifiers = ref(structuredClone(allowedModifiersDefault))
const allowedModifiersEdit = ref(structuredClone(allowedModifiersDefault));
const allowSlowdowns = ref(false)
const sortByNotesHit = ref(false)

const instrumentList = computed(() => {
  const result: Map<string,string> = new Map()
  result.set(bandString, getInstrument(255))
  for (const i in instruments.value) {
    result.set(i, getInstrument(Number(i)))
  }
  return result
})

const availableDifficultyList = computed(() => {
  if (instrument.value == bandString) return undefined
  const result: Record<string,boolean> = {}
  for (let i = Difficulty.Beginner; i <= Difficulty.ExpertPlus; i++) {
    result[i.toString()] = i in instruments.value[Number(instrument.value)]!
  }
  return result
})

fetchSong()
async function fetchSong(){
  try {
    const result = await api.get('song', { params: { id: route.params.id } })
    song.value = result.data.song
  } catch (e) {
    if (axios.isAxiosError(e) && e.status! < 500) {
      error.value = `Error fetching song: ${e.response?.data.message} (${e.response?.status})`
    } else {
      console.log(e)
      error.value = 'An unknown error has occurred.'
    }
  } finally {
    loading.value = false
    if (song.value) {
      fetchScores()
      if (song.value.artist && song.value.album) fetchAlbumArt(song.value.artist, song.value.album)
      // prepare dropdowns...
      for (const i in song.value.availableInstruments) {
        const inst = song.value.availableInstruments[Number(i)]
        const obj = { notes: inst!.notes, starPowerPhrases: inst!.starPowerPhrases }
        if (!(inst!.instrument in instruments.value)) {
          instruments.value[inst!.instrument] = {}
        }
        instruments.value[inst!.instrument]![inst!.difficulty] = obj
      }
      // add Beginner to instruments if Easy exists...
      for (const i in instruments.value) {
        if (1 in instruments.value[i]!) instruments.value[i]![0] = instruments.value[i]![1]
      }
    }

  }
}
async function fetchScores(){

}
async function fetchAlbumArt(artist: string, album: string) {
  const result = await albumArtFinder(artist, album)
  if (result && result.data) {
    imgSrc.value = result.data.album.image[2]['#text']
  }
}

function setPage(i: number) {
  page.value = i
  fetchScores()
}

function setLimit(i: number) {
  limit.value = i
  fetchScores()
}

function setInstrument() {
  if (instrument.value == bandString) {
    // TODO: disable engine tabs if value == bandString
  } else {
    const highestDifficulty = Math.max(...Object.keys(instruments.value[Number(instrument.value)]!).map(k => Number(k)))
    if (!(Number(difficulty.value) in instruments.value[Number(instrument.value)]!)) difficulty.value = highestDifficulty.toString()
  }
  page.value = 1
  fetchScores()
}

function setDifficulty() {
  if (instrument.value == bandString) return;
  const instNumber = Number(instrument.value)
  if (Number(difficulty.value) == Difficulty.ExpertPlus && instNumber < 20 && instNumber >= 30) return;
  page.value = 1
  fetchScores()
}

function setAllowedModifiers() {
  // consolidate edited data into original object
  allowedModifiers.value = structuredClone(toRaw(allowedModifiersEdit.value))
  page.value = 1
  fetchScores()
}

function setOther() {
  // those other values are already being set by v-model - we just need to reset the page and re-fetch scores
  page.value = 1
  fetchScores()
}
</script>

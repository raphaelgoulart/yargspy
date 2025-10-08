<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
    <div class="w-full p-4 pb-2 sm:border rounded-md border-gray-800">
      <p class="mb-5 font-bold text-lg/5 text-white">Song info</p>
      <img :src="imgSrc" class="w-full rounded-md mb-2" />
      <LoadingSpinner v-if="loading" class="text-center mt-4 mb-2" />
      <TheAlert color="red" v-else-if="error" class="text-center"
        ><ExclamationCircleIcon class="size-5 inline" />
        <span class="align-middle ml-1">{{ error }}</span></TheAlert
      >
      <div v-if="song" class="pt-2">
        <h2 class="text-4xl mb-2 font-semibold">{{ song.name }}</h2>
        <p class="text-2xl mb-2">
          by <span class="font-medium">{{ song.artist }}</span
          ><span v-if="song.year">, {{ song.year.replace(',', '').trim() }}</span>
        </p>
        <p v-if="song.album" class="mb-2">From {{ song.album }}</p>
        <p><b>Charted by: </b>{{ song.charter }}</p>
        <hr class="my-4 text-gray-700" />
        <div v-if="Object.keys(instruments).length">
          <FormDropdown
            :disabled="scoreLoading"
            :items="instrumentList"
            v-model="instrument"
            class="mb-2"
            @update:modelValue="setInstrument($event!)"
          />
          <FormDropdown
            :items="new Map([...Array(6).keys()].map((i) => [i.toString(), getDifficulty(i)]))"
            class="mb-2"
            @update:modelValue="setDifficulty($event!)"
            v-model="difficulty"
            :disabled="scoreLoading || instrument == bandString"
            :availableItems="availableDifficultyList"
          />
          <TheButton
            :disabled="scoreLoading"
            color="blue"
            @click="allowedModifiersOpen = !allowedModifiersOpen"
            class="text-center w-full mb-1"
            >Allowed modifiers...</TheButton
          >
          <Transition
            enter-active-class="transition duration-200 ease-out origin-top"
            enter-from-class="opacity-0 scale-y-0"
            enter-to-class="opacity-100 scale-y-100"
            leave-active-class="transition duration-150 ease-in origin-top"
            leave-from-class="opacity-100 scale-y-100"
            leave-to-class="opacity-0 scale-y-0"
          >
            <div v-if="allowedModifiersOpen">
              <FormCheckbox
                v-for="(c, i) in allowedModifiersEdit"
                :key="i"
                :checked="c"
                v-model="allowedModifiersEdit[i]"
                :disabled="scoreLoading"
                >{{ getModifier(Number(i)) }}</FormCheckbox
              >
              <TheButton
                :disabled="scoreLoading"
                @click="setAllowedModifiers()"
                class="text-center w-full mt-1 mb-2"
                >Save</TheButton
              >
            </div>
          </Transition>
        </div>
      </div>
    </div>
    <div class="col-span-3 w-full p-4 sm:border rounded-md border-gray-800">
      <div class="text-sm font-medium text-center border-b border-gray-700 mb-2">
        <ul class="flex flex-wrap -mb-px">
          <TheTab label>Engine</TheTab>
          <TheTab
            v-for="(_, i) in 3"
            :key="i"
            :active="engine == i"
            :disabled="instrument == bandString"
            @click="setEngine(i)"
            >{{ getEngine(i) }}</TheTab
          >
        </ul>
      </div>

      <div class="flex justify-between p-2">
        <div>
          <FormCheckbox v-model="allowSlowdowns" @update:model-value="setOther()"
            >Allow Slowdowns</FormCheckbox
          >
        </div>
        <fieldset v-if="instrument != bandString" :disabled="scoreLoading">
          <div class="flex items-center gap-x-3">
            <legend class="text-sm/6">Sort by:</legend>
            <FormRadio name="sortBy" label="Score" checked @click="setSort(false)" />
            <FormRadio name="sortBy" label="Notes hit" @click="setSort(true)" />
          </div>
        </fieldset>
      </div>
      <LoadingSpinner v-if="scoreLoading" class="text-center" />
      <TheAlert color="red" v-else-if="scoreError" class="text-center"
        ><ExclamationCircleIcon class="size-5 inline" />
        <span class="align-middle ml-1">{{ scoreError }}</span></TheAlert
      >
      <TheAlert color="yellow" v-else-if="scores?.entries.length == 0" class="text-center mt-2"
        ><ExclamationTriangleIcon class="size-5 inline" />
        <span class="align-middle ml-1"
          >No scores found matching the given criteria.</span
        ></TheAlert
      >
      <div v-if="scores?.entries.length && !scoreLoading">
        <div v-if="instrument == bandString">
          <table class="w-full text-sm text-left rtl:text-right text-gray-400">
            <thead class="text-xs bg-gray-700 text-gray-400">
              <tr>
                <th scope="col" class="pl-3 py-2">#</th>
                <th scope="col">Score</th>
                <th scope="col">Band</th>
                <th scope="col">Stars</th>
                <th scope="col">Speed</th>
                <th scope="col">Ver.</th>
                <th scope="col">Played</th>
                <th scope="col" class="pr-3"></th>
              </tr>
            </thead>
            <tbody class="text-sm text-slate-300">
              <ScoreBand
                v-for="(score, i) in scores.entries"
                :key="score._id"
                :score="score"
                :i="i"
                :songName="song!.name"
                :songArtist="song!.artist"
                :instruments="instruments"
              />
            </tbody>
          </table>
        </div>
        <div v-else>
          <table class="w-full text-sm text-left rtl:text-right text-gray-400">
            <thead class="text-xs bg-gray-700 text-gray-400">
              <tr>
                <th scope="col" class="pl-3 py-2">#</th>
                <th scope="col">Score</th>
                <th scope="col">Player</th>
                <th scope="col">Stars</th>
                <th scope="col">Acc.</th>
                <th scope="col">Combo</th>
                <th scope="col">Speed</th>
                <th scope="col">Ver.</th>
                <th scope="col">Played</th>
                <th scope="col" class="pr-3"></th>
              </tr>
            </thead>
            <tbody class="text-sm text-slate-300">
              <ScoreInstrument
                v-for="(score, i) in scores.entries"
                :key="score._id"
                :score="score"
                :i="i"
                :songName="song!.name"
                :songArtist="song!.artist"
                :difficulty="instruments[Number(instrument)]![Number(difficulty)]!"
              />
            </tbody>
          </table>
        </div>
      </div>
      <ThePagination
        v-if="!scoreLoading && scores?.entries.length"
        class="pt-3 border-t-1 border-gray-800"
        :count="scores?.totalEntries"
        :page="page"
        :limit="limit"
        @page="setPage"
        @size="setLimit"
        :page-sizes="[10, 25, 50, 100]"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import TheAlert from '@/components/TheAlert.vue'
import FormDropdown from '@/components/FormDropdown.vue'
import { ExclamationCircleIcon, ExclamationTriangleIcon } from '@heroicons/vue/20/solid'
import { albumArtFinder } from '@/plugins/albumArtFinder'
import api from '@/plugins/axios'
import axios from 'axios'
import { computed, ref, toRaw } from 'vue'
import { useRoute } from 'vue-router'
import { Difficulty, type IScoreEntriesResponse, type ISong } from '@/plugins/types'
import { getInstrument, getDifficulty, getModifier, getEngine } from '@/plugins/utils'
import TheButton from '@/components/TheButton.vue'
import FormCheckbox from '@/components/FormCheckbox.vue'
import TheTab from '@/components/TheTab.vue'
import FormRadio from '@/components/FormRadio.vue'
import ThePagination from '@/components/ThePagination.vue'
import ScoreInstrument from '@/components/ScoreInstrument.vue'
import ScoreBand from '@/components/ScoreBand.vue'

interface ISongScoresQuery {
  id: string
  instrument: number
  difficulty?: number
  engine?: number
  allowedModifiers?: Array<number>
  allowSlowdowns: boolean
  sortByNotesHit?: boolean
  page: number
  limit: number
}

const bandString = '255'
const imgSrc = ref('/src/assets/img/song.png')
const route = useRoute()
const allowedModifiersOpen = ref(false)

const loading = ref(true)
const scoreLoading = ref(true)
const error = ref('')
const scoreError = ref('')

const song = ref(null as ISong | null)
const scores = ref(null as IScoreEntriesResponse | null)
const instruments = ref({} as Record<number, Record<number, object>>)
const page = ref(1)
const limit = ref(25)

const instrument = ref(bandString)
const difficulty = ref(Difficulty.Expert.toString())
const engine = ref(0) // Default
const allowedModifiersDefault: { [key: number]: boolean } = {
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
  10: true,
}
const allowedModifiers = ref(structuredClone(allowedModifiersDefault))
const allowedModifiersEdit = ref(structuredClone(allowedModifiersDefault))
const allowSlowdowns = ref(false)
const sortByNotesHit = ref(false)

const instrumentList = computed(() => {
  const result: Map<string, string> = new Map()
  result.set(bandString, getInstrument(255))
  for (const i in instruments.value) {
    result.set(i, getInstrument(Number(i)))
  }
  return result
})

const availableDifficultyList = computed(() => {
  if (instrument.value == bandString) return undefined
  const result: Record<string, boolean> = {}
  for (let i = Difficulty.Beginner; i <= Difficulty.ExpertPlus; i++) {
    result[i.toString()] = i in instruments.value[Number(instrument.value)]!
  }
  return result
})

fetchSong()
async function fetchSong() {
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
async function fetchScores() {
  scoreLoading.value = true
  scoreError.value = ''
  try {
    const params: ISongScoresQuery = {
      id: song.value!._id,
      instrument: Number(instrument.value),
      allowSlowdowns: allowSlowdowns.value,
      allowedModifiers: Object.keys(allowedModifiers.value)
        .filter((key) => allowedModifiers.value[Number(key)])
        .map(Number),
      page: page.value,
      limit: limit.value,
    }
    if (instrument.value != bandString) {
      params.difficulty = Number(difficulty.value)
      params.engine = engine.value
      params.sortByNotesHit = sortByNotesHit.value
    }
    const result = await api.post('song/leaderboard', params)
    scores.value = result.data as IScoreEntriesResponse
  } catch (e) {
    if (axios.isAxiosError(e) && e.status! < 500) {
      scoreError.value = `An error occurred while fetching the user's scores: ${e.response?.data.message} (${e.response?.status})`
    } else {
      console.log(e)
      scoreError.value = "An unknown error has occurred while fetching the user's scores."
    }
  } finally {
    scoreLoading.value = false
  }
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

function setInstrument(value: string) {
  instrument.value = value
  if (instrument.value != bandString) {
    const highestDifficulty = Math.max(
      ...Object.keys(instruments.value[Number(instrument.value)]!).map((k) => Number(k)),
    )
    if (!(Number(difficulty.value) in instruments.value[Number(instrument.value)]!))
      difficulty.value = highestDifficulty.toString()
  }
  page.value = 1
  fetchScores()
}

function setDifficulty(value: string) {
  difficulty.value = value
  if (instrument.value == bandString) return
  const instNumber = Number(instrument.value)
  if (Number(difficulty.value) == Difficulty.ExpertPlus && instNumber < 20 && instNumber >= 30)
    return
  page.value = 1
  fetchScores()
}

function setAllowedModifiers() {
  // consolidate edited data into original object
  allowedModifiers.value = structuredClone(toRaw(allowedModifiersEdit.value))
  page.value = 1
  fetchScores()
}

function setEngine(i: number) {
  if (instrument.value == bandString) return
  engine.value = i
  page.value = 1
  fetchScores()
}

function setSort(value: boolean) {
  if (sortByNotesHit.value == value) return
  sortByNotesHit.value = value
  page.value = 1
  fetchScores()
}

function setOther() {
  // those other values are already being set by v-model - we just need to reset the page and re-fetch scores
  page.value = 1
  fetchScores()
}
</script>

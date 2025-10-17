<template>
  <tr class="border-t-1 border-gray-800">
    <td scope="col" class="pl-3 py-2">
      <b
        :class="
          i == 0 ? 'text-yellow-300' : i == 1 ? 'text-gray-300' : i == 2 ? 'text-amber-600' : ''
        "
        >{{ getNumberWithOrdinal(i + 1) }}</b
      >
    </td>
    <td scope="col" class="font-semibold">
      {{ score.score.toLocaleString() }}
    </td>
    <td
      scope="col"
      class="font-medium"
      :title="score.modifiers.length ? 'This player used at least one modifier' : ''"
    >
      <CountryFlag :code="score.uploader.country" :size="1" class="mr-1" />
      <RouterLink :to="{ name: 'player', params: { username: score.uploader.username } }">{{
        score.uploader.username
      }}</RouterLink
      ><span v-if="score.modifiers.length">*</span>
    </td>
    <td scope="col">
      <ScoreStars :stars="score.stars" />
    </td>
    <td scope="col">
      <ScorePercent :n="score.percent!" :overhits="score.overhits" /><span
        class="hidden lg:inline text-xs"
      >
        ({{ score.notesHit?.toLocaleString() }}/{{ difficulty.notes.toLocaleString() }})</span
      >
    </td>
    <td scope="col">
      {{ score.maxCombo!.toLocaleString() }}
    </td>
    <td scope="col">
      {{ percent(score.songSpeed) }}
    </td>
    <td scope="col">
      {{ getVersion(score.version) }}
    </td>
    <td scope="col">
      {{ convertedDateTime(score.createdAt, true) }}
    </td>
    <td scope="col" class="pr-3 text-right">
      <div class="flex justify-end items-center gap-1">
        <TrashIcon
          v-if="auth.user && auth.user.admin"
          @click="$emit('delete')"
          class="w-5 text-red-500 hover:cursor-pointer transition-transform duration-200 hover:scale-120"
        />
        <a
          :href="getDownloadLink(score.replayPath)"
          :download="getDownloadFileName(score, score.uploader.username, songName, songArtist)"
          ><ArrowDownTrayIcon class="w-5 transition-transform duration-200 hover:scale-110"
        /></a>
        <a @click="open = !open">
          <ChevronUpIcon
            v-if="open"
            class="w-5 hover:cursor-pointer transition-transform duration-200 hover:scale-120"
          />
          <ChevronDownIcon
            v-else
            class="w-5 hover:cursor-pointer transition-transform duration-200 hover:scale-120"
          />
        </a>
      </div>
    </td>
  </tr>
  <Transition
    enter-active-class="transition duration-200 ease-out origin-top"
    enter-from-class="opacity-0 scale-y-0"
    enter-to-class="opacity-100 scale-y-100"
    leave-active-class="transition duration-150 ease-in origin-top"
    leave-from-class="opacity-100 scale-y-100"
    leave-to-class="opacity-0 scale-y-0"
  >
    <tr v-if="open">
      <td colspan="10" class="px-3 pt-1 pb-2 text-xs">
        <div class="grid grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(0rem,1fr))]">
          <div><b>Profile name: </b>{{ score.profileName }}</div>
          <div><b>Modifiers: </b><ScoreModifiers :modifiers="score.modifiers" /></div>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(0rem,1fr))]">
          <div v-if="isGuitar(score.gamemode!)">
            <b>Overstrums: </b>{{ score.overhits?.toLocaleString() }}
          </div>
          <div v-if="isDrums(score.gamemode!) || isKeys(score.gamemode!)">
            <b>Overhits: </b>{{ score.overhits?.toLocaleString() }}
          </div>
          <div>
            <b>SP phrases hit: </b>{{ score.starPowerPhrasesHit?.toLocaleString() }}/{{
              difficulty.starPowerPhrases.toLocaleString()
            }}
          </div>
          <div><b>SP activations: </b>{{ score.starPowerActivationCount?.toLocaleString() }}</div>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(0rem,1fr))]">
          <div><b>Solo bonuses: </b>{{ score.soloBonuses?.toLocaleString() }}</div>
          <div v-if="isGuitar(score.gamemode!) || isKeys(score.gamemode!)">
            <b>Sustain score: </b>{{ score.sustainScore?.toLocaleString() }}
          </div>
          <div v-if="isGuitar(score.gamemode!)">
            <b>Ghost inputs: </b>{{ score.ghostInputs?.toLocaleString() }}
          </div>
          <div v-if="isDrums(score.gamemode!)">
            <b>Ghosts hit: </b>{{ score.ghostNotesHit?.toLocaleString() }}
          </div>
          <div v-if="isDrums(score.gamemode!)">
            <b>Accents hit: </b>{{ score.accentNotesHit?.toLocaleString() }}
          </div>
        </div>
      </td>
    </tr>
  </Transition>
</template>

<script setup lang="ts">
import type { IScore } from '@/plugins/types'
import { ref, type PropType } from 'vue'
import {
  getNumberWithOrdinal,
  convertedDateTime,
  getDownloadLink,
  getDownloadFileName,
  getVersion,
  percent,
  isGuitar,
  isDrums,
  isKeys,
} from '@/plugins/utils'
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowDownTrayIcon,
  TrashIcon,
} from '@heroicons/vue/20/solid'
import ScorePercent from './ScorePercent.vue'
import ScoreStars from './ScoreStars.vue'
import ScoreModifiers from './ScoreModifiers.vue'
import { RouterLink } from 'vue-router'
import CountryFlag from './CountryFlag.vue'
import { useAuthStore } from '@/stores/auth'

const open = ref(false)
defineProps({
  score: { type: Object as PropType<IScore>, required: true },
  i: { type: Number, required: true },
  songName: { type: String, required: true },
  songArtist: { type: String, required: true },
  difficulty: { type: Object, required: true },
})
const auth = useAuthStore()
</script>

<template>
  <tr class="border-t-1 border-gray-800">
    <td scope="col" class="pl-3 py-2">
      <RouterLink
        :to="{ name: 'leaderboard', params: { id: score.song._id } }"
        class="font-semibold"
        >{{ score.song.name }}</RouterLink
      >
      <span v-if="score.songSpeed != 1"> ({{ percent(score.songSpeed) }})</span><br />
      <span class="text-xs"
        >{{ score.song.artist }} (<StringColorParsed :value="score.song.charter" />)</span
      >
    </td>
    <td scope="col">
      {{ getInstrument(score.instrument) }}<br />
      <span class="text-xs"
        >{{ getDifficulty(score.difficulty!) }}
        <span v-if="score.engine! > 0">({{ getEngine(score.engine!) }})</span></span
      >
    </td>
    <td scope="col">
      <ScoreStars :stars="score.stars" /><span class="text-white font-semibold">{{
        score.score.toLocaleString()
      }}</span>
    </td>
    <td scope="col">
      <ScorePercent :n="score.percent!" />
    </td>
    <td scope="col">
      {{ convertedDateTime(score.createdAt, true) }}
    </td>
    <td scope="col" class="pr-3 text-right">
      <div class="flex justify-end items-center gap-1">
        <a
          :href="getDownloadLink(score.replayPath)"
          :download="getDownloadFileName(score, username, score.song.name, score.song.artist)"
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
      <td colspan="6" class="px-3 pt-1 pb-2 text-xs">
        <div class="grid grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(0rem,1fr))]">
          <div><b>Game version: </b>{{ getVersion(score.version) }}</div>
          <div><b>Profile name: </b>{{ score.profileName }}</div>
          <div class="col-span-2">
            <b>Modifiers: </b><ScoreModifiers :modifiers="score.modifiers" />
          </div>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(0rem,1fr))]">
          <div><b>Notes hit: </b>{{ score.notesHit?.toLocaleString() }}</div>
          <div><b>Max combo: </b>{{ score.maxCombo?.toLocaleString() }}</div>
          <div><b>SP phrases hit: </b>{{ score.starPowerPhrasesHit?.toLocaleString() }}</div>
          <div><b>SP activations: </b>{{ score.starPowerActivationCount?.toLocaleString() }}</div>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(0rem,1fr))]">
          <div v-if="isGuitar(score.gamemode!)">
            <b>Overstrums: </b>{{ score.overhits?.toLocaleString() }}
          </div>
          <div v-if="isDrums(score.gamemode!) || isKeys(score.gamemode!)">
            <b>Overhits: </b>{{ score.overhits?.toLocaleString() }}
          </div>
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
import { type IScore } from '@/plugins/types'
import {
  convertedDateTime,
  getDifficulty,
  getEngine,
  getInstrument,
  percent,
  getDownloadLink,
  getDownloadFileName,
  getVersion,
} from '@/plugins/utils'
import { ref, type PropType } from 'vue'
import ScorePercent from './ScorePercent.vue'
import ScoreStars from './ScoreStars.vue'
import ScoreModifiers from './ScoreModifiers.vue'
import StringColorParsed from './StringColorParsed.vue'
import { ArrowDownTrayIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/vue/20/solid'
import { isGuitar, isDrums, isKeys } from '@/plugins/utils'

const open = ref(false)
defineProps({
  score: { type: Object as PropType<IScore>, required: true },
  username: { type: String, required: true },
})
</script>

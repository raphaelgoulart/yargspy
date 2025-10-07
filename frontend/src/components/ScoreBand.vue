<template>
  <tr class="border-t-1 border-gray-800">
    <td scope="col" class="pl-3 py-2">
      <b :class="i==0 ? 'text-yellow-300' : i==1 ? 'text-gray-300' : i==2 ? 'text-amber-600' : ''">{{ getNumberWithOrdinal(i+1) }}</b>
    </td>
    <td scope="col" class="font-semibold">
      {{ score.score.toLocaleString() }}
    </td>
    <td scope="col" class="font-medium" :title="score.modifiers.length ? 'At least one player used a modifier' : ''">
      <CountryFlag :code="score.uploader.country" :size="1" /> <RouterLink :to="'/player/'+score.uploader.username">{{ score.uploader.username }}</RouterLink>'s band<span v-if="score.modifiers.length">*</span>
      <span class="text-xs"> ({{ score.childrenScores.length }} {{ score.childrenScores.length > 1 ? 'players' : 'player' }})</span>
    </td>
    <td scope="col">
      <ScoreStars :stars="score.stars" />
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
        <a :href="getDownloadLink(score.replayPath)" :download="getDownloadFileName(score, score.uploader.username, songName, songArtist)"><ArrowDownTrayIcon class="w-5 transition-transform duration-200 hover:scale-110" /></a>
        <a @click="open = !open">
          <ChevronUpIcon v-if="open" class="w-5 hover:cursor-pointer transition-transform duration-200 hover:scale-120" />
          <ChevronDownIcon v-else class="w-5 hover:cursor-pointer transition-transform duration-200 hover:scale-120" />
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
    leave-to-class="opacity-0 scale-y-0">
    <tr v-if="open">
      <td colspan="8" class="px-3 pt-1 pb-2 text-xs bg-gray-800">
        <table class="w-full text-sm text-left rtl:text-right text-gray-400">
            <thead class="text-xs text-gray-400">
                <tr>
                    <th scope="col" class="pl-3 py-2">
                      Score
                    </th>
                    <th scope="col">
                      Profile
                    </th>
                    <th scope="col">
                      Instrument
                    </th>
                    <th scope="col">
                      Acc.
                    </th>
                    <th scope="col">
                      Combo
                    </th>
                    <th scope="col">
                      SP
                    </th>
                    <th scope="col" class="pr-3">
                    </th>
                </tr>
            </thead>
            <tbody class="text-sm text-slate-300">
              <ScoreBandMember v-for="score in score.childrenScores" :key='score._id' :score="score" :difficulty="instruments[score.instrument][score.difficulty!]" />
            </tbody>
          </table>
      </td>
    </tr>
  </Transition>
</template>

<script setup lang="ts">
import type { IScore } from '@/plugins/types';
import { ref, type PropType } from 'vue';
import { getNumberWithOrdinal, convertedDateTime, getDownloadLink, getDownloadFileName, getVersion, percent } from '@/plugins/utils'
import { ChevronUpIcon, ChevronDownIcon, ArrowDownTrayIcon } from '@heroicons/vue/20/solid';
import ScoreStars from './ScoreStars.vue';
import CountryFlag from './CountryFlag.vue';
import ScoreBandMember from './ScoreBandMember.vue';

const open = ref(false)
defineProps({
  score: {type: Object as PropType<IScore>, required: true},
  i: {type: Number, required: true},
  songName: {type: String, required: true},
  songArtist: {type: String, required: true},
  instruments: {type: Object, required: true}
})
</script>

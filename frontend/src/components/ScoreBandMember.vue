<template>
  <tr class="border-t-1 border-gray-800">
    <td scope="col" class="font-semibold pl-3">
      <ScoreStars :stars="score.stars" />{{ score.score.toLocaleString() }}
    </td>
    <td
      scope="col"
      class="font-medium"
      :title="score.modifiers.length ? 'This player used at least one modifier' : ''"
    >
      {{ score.profileName }}<span v-if="score.modifiers.length">*</span>
    </td>
    <td scope="col">
      {{ getInstrument(score.instrument) }}<br />
      <span class="text-xs"
        >{{ getDifficulty(score.difficulty!) }}
        <span v-if="score.engine! > 0">({{ getEngine(score.engine!) }})</span></span
      >
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
      {{ score.starPowerPhrasesHit?.toLocaleString() }}/{{
        difficulty.starPowerPhrases.toLocaleString()
      }}
    </td>
    <td scope="col" class="pr-3 text-right">
      <div class="flex justify-end items-center gap-1">
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
          <div><b>Modifiers: </b><ScoreModifiers :modifiers="score.modifiers" /></div>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(0rem,1fr))]">
          <div v-if="isGuitar(score.gamemode!)">
            <b>Overstrums: </b>{{ score.overhits?.toLocaleString() }}
          </div>
          <div v-if="isDrums(score.gamemode!) || isKeys(score.gamemode!)">
            <b>Overhits: </b>{{ score.overhits?.toLocaleString() }}
          </div>
          <div><b>SP activations: </b>{{ score.starPowerActivationCount?.toLocaleString() }}</div>
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
import { getDifficulty, getInstrument, getEngine, isGuitar, isDrums, isKeys } from '@/plugins/utils'
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/vue/20/solid'
import ScoreStars from './ScoreStars.vue'
import ScorePercent from './ScorePercent.vue'
import ScoreModifiers from './ScoreModifiers.vue'

const open = ref(false)
defineProps({
  score: { type: Object as PropType<IScore>, required: true },
  difficulty: { type: Object, required: true },
})
</script>

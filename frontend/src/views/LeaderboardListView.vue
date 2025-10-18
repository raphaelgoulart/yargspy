<template>
  <h1 class="text-center text-4xl font-bold mb-8">LEADERBOARDS</h1>
  <div class="w-full my-6 px-2">
    <form class="flex w-full" @submit.prevent="setSearch()">
      <Listbox v-model="searchMethodInput" @update:model-value="searchInput = ''">
        <div class="relative inline-block">
          <ListboxButton
            :disabled="loading"
            class="md:whitespace-nowrap pl-3.5 inline-block py-2 text-sm rounded-l-md hover:cursor-pointer disabled:cursor-not-allowed bg-gray-800 border border-gray-600 text-white"
          >
            Search by {{ searchLabel
            }}<ChevronDownIcon
              class="h-5 w-5 text-gray-400 inline-block mx-1.5"
              aria-hidden="true"
            />
          </ListboxButton>
          <Transition
            enter-active-class="transition duration-50 ease-in"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition duration-50 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <ListboxOptions
              class="absolute text-right w-full mt-1 rounded-l-md bg-gray-800 py-1 text-base text-sm border border-gray-700"
            >
              <ListboxOption
                v-slot="{ active, selected }"
                v-for="(sm, i) in searchMethods"
                :key="i"
                :value="i"
                as="template"
              >
                <li
                  :class="[
                    active ? 'bg-gray-700' : '',
                    'relative cursor-default select-none py-1 px-2',
                  ]"
                >
                  <span :class="selected ? 'text-white font-bold' : 'text-slate-300'">
                    {{ sm }}</span
                  >
                </li>
              </ListboxOption>
            </ListboxOptions>
          </Transition>
        </div>
      </Listbox>
      <input
        type="text"
        name="value"
        v-model="searchInput"
        placeholder="Value to search for..."
        class="w-full px-4 py-2 text-sm bg-gray-800 text-white border-y border-gray-600 focus:outline-none focus:ring-1 ring-inset focus:ring-blue-500"
      />
      <button
        type="submit"
        :disabled="loading"
        class="px-3.5 py-2 hover:cursor-pointer transition text-sm duration-150 ease-in-out text-white rounded-r-md disabled:bg-blue-400 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 focus-visible:outline-blue-50 focus-visible:outline-offset-2"
      >
        Search
      </button>
    </form>
    <div class="mt-2 flex justify-end items-center">
      <Listbox v-model="sortMethodInput">
        <div class="relative inline-block">
          <ListboxButton
            :disabled="loading"
            class="md:whitespace-nowrap pl-3.5 inline-block py-2 text-sm rounded-md hover:cursor-pointer disabled:cursor-not-allowed bg-gray-800 border border-gray-600 text-white"
          >
            {{ sortLabel
            }}<ChevronDownIcon
              class="h-5 w-5 text-gray-400 inline-block mx-1.5"
              aria-hidden="true"
            />
          </ListboxButton>
          <Transition
            enter-active-class="transition duration-50 ease-in"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition duration-50 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <ListboxOptions
              class="absolute text-right w-full mt-1 rounded-md bg-gray-800 py-1 text-base text-sm border border-gray-700"
            >
              <ListboxOption
                v-slot="{ active, selected }"
                v-for="(sm, i) in sortMethods"
                :key="i"
                :value="i"
                as="template"
              >
                <li
                  :class="[
                    active ? 'bg-gray-700' : '',
                    'relative cursor-default select-none py-1 px-2',
                  ]"
                >
                  <span :class="selected ? 'text-white font-bold' : 'text-slate-300'">
                    {{ sm }}</span
                  >
                </li>
              </ListboxOption>
            </ListboxOptions>
          </Transition>
        </div>
      </Listbox>
      <Switch
        :disabled="loading"
        v-model="sortDesc"
        class="inline-flex disabled:cursor-not-allowed bg-gray-700 ml-2 h-8 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
      >
        <span class="sr-only">Descending sort</span>
        <span
          aria-hidden="true"
          :class="sortDesc ? 'translate-x-5' : 'translate-x-0'"
          class="pointer-events-none inline-block h-7 w-7 transform rounded-full bg-slate-400 text-white hadow-lg ring-0 transition duration-200 ease-out"
        >
          <ChevronDoubleDownIcon v-if="sortDesc" />
          <ChevronDoubleUpIcon v-else />
        </span>
      </Switch>
    </div>
  </div>
  <LoadingSpinner v-if="loading" class="text-center" />
  <TheAlert color="red" v-else-if="error" class="text-center"
    ><ExclamationCircleIcon class="size-5 inline" />
    <span class="align-middle ml-1">{{ error }}</span></TheAlert
  >
  <div v-else-if="data && data.entries.length" class="text-center lg:text-left">
    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center lg:justify-items-left"
    >
      <CardLeaderboard
        v-for="leaderboard in data.entries"
        class="w-full p-2"
        :key="leaderboard._id"
        :id="leaderboard._id"
        :name="leaderboard.name"
        :artist="leaderboard.artist"
        :charter="leaderboard.charter"
        :album="leaderboard.album"
        :playerCount="leaderboard.playerCount"
      />
    </div>
    <ThePagination
      class="mt-3"
      :count="data.totalEntries"
      :page="page"
      :limit="limit"
      @page="setPage"
      @size="setLimit"
      :page-sizes="[8, 16, 32, 64]"
    />
  </div>
  <TheAlert color="yellow" v-else class="text-center align-middle"
    ><ExclamationTriangleIcon class="size-5 inline" />
    <span class="ml-1">No songs were found using the specified criteria.</span></TheAlert
  >
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  ChevronDownIcon,
  ChevronDoubleUpIcon,
  ChevronDoubleDownIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/20/solid'
import { Listbox, ListboxButton, ListboxOptions, ListboxOption, Switch } from '@headlessui/vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import TheAlert from '@/components/TheAlert.vue'
import ThePagination from '@/components/ThePagination.vue'
import axios from 'axios'
import api from '@/plugins/axios'
import CardLeaderboard from '@/components/CardLeaderboard.vue'
import type { ILeaderboardEntriesResponse } from '@/plugins/types'

interface ILeaderboardQuery {
  page: number
  limit: number
  name?: string
  artist?: string
  charter?: string
  sort?: number
  descending?: boolean
}

const loading = ref(true)
const error = ref('')

const searchMethods = ['Song name', 'Artist', 'Charter']
const searchMethod = ref(0)
const searchMethodInput = ref(0)
const sortMethods = ["Don't sort", 'Player count', 'Song name', 'Artist', 'Charter']
const sortMethod = ref(1)
const sortMethodInput = ref(1)
const sortDesc = ref(true)
const search = ref('')
const searchInput = ref('')

const searchLabel = computed(() => searchMethods[searchMethodInput.value]?.toLowerCase())
const sortLabel = computed(() => {
  const label = sortMethods[sortMethodInput.value]
  if (sortMethodInput.value == 0) return label
  return 'Sort by ' + label?.toLowerCase()
})

const data = ref(null as ILeaderboardEntriesResponse | null)

const page = ref(1)
const limit = ref(16)

onMounted(async () => {
  fetchLeaderboards()
})

async function fetchLeaderboards() {
  loading.value = true
  error.value = ''
  try {
    const params = { page: page.value, limit: limit.value } as ILeaderboardQuery
    if (search.value)
      switch (searchMethod.value) {
        case 0:
          params.name = search.value
          break
        case 1:
          params.artist = search.value
          break
        case 2:
          params.charter = search.value
          break
      }
    if (sortMethod.value) {
      params.sort = sortMethod.value
      if (sortDesc.value) params.descending = true
    }
    const songs = await api.get('/song/entries', {
      params: params,
    })
    data.value = songs.data
    console.log(songs.data)
  } catch (e) {
    if (axios.isAxiosError(e) && e.status! < 500) {
      error.value = `An error occurred: ${e.response?.data.message} (${e.response?.status})`
    } else {
      console.log(e)
      error.value = 'An unknown error has occurred.'
    }
  } finally {
    loading.value = false
  }
}

function setSearch() {
  search.value = searchInput.value
  searchMethod.value = searchMethodInput.value
  sortMethod.value = sortMethodInput.value
  fetchLeaderboards()
}

function setPage(i: number) {
  page.value = i
  fetchLeaderboards()
}

function setLimit(i: number) {
  page.value = 1
  limit.value = i
  fetchLeaderboards()
}
</script>

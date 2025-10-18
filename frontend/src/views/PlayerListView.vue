<template>
  <h1 class="text-center text-4xl font-bold mb-8">PLAYERS</h1>
  <div class="w-full my-6 px-2">
    <form class="flex w-full" @submit.prevent="setUsername(usernameInput)">
      <input
        type="text"
        name="username"
        v-model="usernameInput"
        placeholder="Username to search for..."
        class="w-full px-4 py-2 text-sm bg-gray-800 text-white border border-r-0 border-gray-600 rounded-l-md focus:outline-none focus:ring-1 ring-inset focus:ring-blue-500"
      />
      <button
        type="submit"
        :disabled="
          loading ||
          (usernameInput.length > 0 && (usernameInput.length < 3 || usernameInput.length > 32))
        "
        class="px-3.5 py-2 hover:cursor-pointer transition text-sm duration-150 ease-in-out text-white rounded-r-md disabled:bg-blue-400 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 focus-visible:outline-blue-50 focus-visible:outline-offset-2"
      >
        Search
      </button>
    </form>
  </div>
  <LoadingSpinner v-if="loading" class="text-center" />
  <TheAlert color="red" v-else-if="error" class="text-center"
    ><ExclamationCircleIcon class="size-5 inline" />
    <span class="align-middle ml-1">{{ error }}</span></TheAlert
  >
  <div v-else-if="data && data.entries.length" class="text-center lg:text-left">
    <div
      class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 justify-items-center lg:justify-items-left"
    >
      <CardPlayer
        v-for="user in data.entries"
        :key="user._id"
        :username="user.username"
        :profile-photo-url="user.profilePhotoURL"
        :country="user.country"
      />
    </div>
    <ThePagination
      class="mt-3"
      :count="data.totalEntries"
      :page="page"
      :limit="limit"
      @page="setPage"
      @size="setLimit"
      :page-sizes="[6, 12, 24, 48]"
    />
  </div>
  <TheAlert color="yellow" v-else class="text-center align-middle"
    ><ExclamationTriangleIcon class="size-5 inline" />
    <span class="ml-1">No players were found using the specified criteria.</span></TheAlert
  >
</template>

<script setup lang="ts">
import api from '@/plugins/axios'
import { onMounted, ref } from 'vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import TheAlert from '@/components/TheAlert.vue'
import axios from 'axios'
import { ExclamationCircleIcon, ExclamationTriangleIcon } from '@heroicons/vue/20/solid'
import CardPlayer from '@/components/CardPlayer.vue'
import ThePagination from '@/components/ThePagination.vue'
import type { IUserEntriesResponse } from '@/plugins/types'

interface IPlayerQuery {
  page: number
  limit: number
  username?: string
}

const data = ref(null as IUserEntriesResponse | null)
const loading = ref(true)
const error = ref('')
const username = ref('')
const page = ref(1)
const limit = ref(12)
const usernameInput = ref('')

onMounted(async () => {
  fetchPlayers()
})

async function fetchPlayers() {
  if (username.value && (username.value.length < 3 || username.value.length > 32)) return
  loading.value = true
  error.value = ''
  try {
    const params = { page: page.value, limit: limit.value } as IPlayerQuery
    if (username.value) params.username = username.value
    const users = await api.get('/user/entries', {
      params: params,
    })
    data.value = users.data
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

function setUsername(s: string) {
  username.value = s
  fetchPlayers()
}

function setPage(i: number) {
  page.value = i
  fetchPlayers()
}

function setLimit(i: number) {
  page.value = 1
  limit.value = i
  fetchPlayers()
}
</script>

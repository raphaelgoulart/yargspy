<template>
  <div class="pt-20">
    <div class="banner" :style="{ backgroundImage: bannerSrc }">
      <div class="mx-auto container flex">
        <img :src="imgSrc" class="w-64 h-64 relative top-6 rounded-md object-cover" />
        <div class="mx-4 mt-12 mb-auto bg-black/50 rounded-md p-4" v-if="user">
          <div
            class="inline-flex items-center gap-3 mb-2 text-5xl font-semibold"
            :class="user ? 'text-white' : 'text-gray-400'"
          >
            <CountryFlag v-if="user" :code="user.country" :size="10" />
            <h1>{{ user.username }}</h1>
          </div>
          <br />
          <div class="inline-flex gap-3 mt-1" v-if="user.admin || !user.active">
            <TheBadge color="red" v-if="!user.active">Banned</TheBadge>
            <TheBadge color="dark" v-if="user.admin">Admin</TheBadge>
          </div>
        </div>
        <div
          class="mx-4 my-15 ml-auto"
          v-if="user && auth.user && (auth.user._id == user?._id || auth.user.admin)"
        >
          <TheButton v-if="user._id != auth.user._id" color="red" class="mr-1">{{
            user.active ? 'Ban user' : 'Unban user'
          }}</TheButton>
          <TheButton>Edit profile</TheButton>
        </div>
      </div>
    </div>
  </div>
  <div class="container mx-auto mt-10">
    <LoadingSpinner v-if="loading" class="text-center" />
    <TheAlert color="red" v-else-if="error" class="text-center"
      ><ExclamationCircleIcon class="size-5 inline" />
      <span class="align-middle ml-1">{{ error }}</span></TheAlert
    >
    <div v-if="user">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="w-full p-4 pb-2 sm:border rounded-md border-gray-800">
          <p class="mb-5 font-bold text-lg/5 text-white">General info</p>
          <p class="mb-2"><b>Joined: </b>{{ convertedDateTime(user.createdAt) }}</p>
          <p class="mb-2"><b>Last active: </b>{{ convertedDateTime(user.updatedAt) }}</p>
          <p v-if="scores" class="mb-2">
            <b>Submitted runs: </b> {{ scores.totalEntries.toLocaleString() }}
          </p>
        </div>
        <div class="col-span-3 w-full p-4 sm:border rounded-md border-gray-800">
          <span class="mb-5 font-bold text-lg/5 text-white">Latest submissions</span>
          <LoadingSpinner v-if="scoreLoading" class="text-center" />
          <TheAlert color="yellow" v-else-if="scores?.entries.length == 0" class="text-center mt-2"
            ><ExclamationTriangleIcon class="size-5 inline" />
            <span class="align-middle ml-1">No scores found for this user.</span></TheAlert
          >
          <div class="relative overflow-x-auto mt-5" v-if="scores?.entries.length && !scoreLoading">
            <table class="w-full text-sm text-left rtl:text-right text-gray-400">
              <thead class="text-xs bg-gray-700 text-gray-400">
                <tr>
                  <th scope="col" class="pl-3 py-2">Song</th>
                  <th scope="col">Instrument</th>
                  <th scope="col">Score</th>
                  <th scope="col">Acc.</th>
                  <th scope="col">Played</th>
                  <th scope="col" class="pr-3"></th>
                </tr>
              </thead>
              <tbody class="text-sm text-slate-300">
                <ScorePlayer
                  v-for="score in scores.entries"
                  :key="score._id"
                  :score="score"
                  :username="user.username"
                />
              </tbody>
            </table>
            <ThePagination
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CountryFlag from '@/components/CountryFlag.vue'
import TheAlert from '@/components/TheAlert.vue'
import TheBadge from '@/components/TheBadge.vue'
import TheButton from '@/components/TheButton.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ScorePlayer from '@/components/ScorePlayer.vue'
import api from '@/plugins/axios'
import type { IUser, IScoreEntriesResponse } from '@/plugins/types'
import { useAuthStore } from '@/stores/auth'
import { ExclamationCircleIcon, ExclamationTriangleIcon } from '@heroicons/vue/20/solid'
import axios from 'axios'
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import ThePagination from '@/components/ThePagination.vue'
import { convertedDateTime } from '@/plugins/utils'
import defaultPlayerImg from '../assets/img/avatar.jpg'

const loading = ref(true)
const scoreLoading = ref(true)
const error = ref('')
const route = useRoute()
const user = ref(null as IUser | null)
const scores = ref(null as IScoreEntriesResponse | null)

const imgSrc = ref(defaultPlayerImg)
const bannerSrc = ref("url('https://yarg.in/notes.webp'), url('https://yarg.in/gradient.webp')")

interface IPlayerScoresQuery {
  id: string
  page: number
  limit: number
}
const page = ref(1)
const limit = ref(10)

const auth = useAuthStore()

fetchUser()
async function fetchUser() {
  try {
    const result = await api.get('user/profile', { params: { username: route.params.username } })
    user.value = result.data.user
    fetchScores()
    if (user.value?.profilePhotoURL) imgSrc.value = user.value.profilePhotoURL
    if (user.value?.bannerURL) bannerSrc.value = `url('${encodeURI(user.value.bannerURL)}')`
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
async function fetchScores() {
  scoreLoading.value = true
  error.value = ''
  try {
    const params: IPlayerScoresQuery = {
      id: user.value!._id,
      page: page.value,
      limit: limit.value,
    }
    const result = await api.get('user/scores', { params })
    scores.value = result.data as IScoreEntriesResponse
  } catch (e) {
    if (axios.isAxiosError(e) && e.status! < 500) {
      error.value = `An error occurred while fetching the user's scores: ${e.response?.data.message} (${e.response?.status})`
    } else {
      console.log(e)
      error.value = "An unknown error has occurred while fetching the user's scores."
    }
  } finally {
    scoreLoading.value = false
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
</script>

<style scoped>
.banner {
  background-size: cover;
}
</style>

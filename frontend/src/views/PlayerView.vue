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
          <TheButton
            v-if="user._id != auth.user._id"
            color="red"
            class="mr-1"
            @click="banOpen = true"
            >{{ banLabel }}</TheButton
          >
          <TheButton @click="editOpen = true">Edit profile</TheButton>
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
  <TheModal :open="editOpen" @close="editOpen = false" title="Edit Profile">
    <div class="mt-2">
      <form ref="editForm">
        <FormInput
          name="profilePhotoURL"
          label="Profile Picture URL"
          placeholder="https://..."
          v-model="editData.profilePhotoURL"
        />
        <div class="flex my-2">
          <img
            class="size-16 rounded-sm object-cover"
            :src="editData.profilePhotoURL ? editData.profilePhotoURL : defaultPlayerImg"
          />
          <span class="text-sm font-medium pl-1">Preview</span>
        </div>
        <FormInput
          name="bannerURL"
          label="Banner URL"
          placeholder="https://..."
          v-model="editData.bannerURL"
        />
        <img
          class="rounded-sm w-full h-16 mt-2 object-cover"
          :src="editData.bannerURL"
          v-show="editData.bannerURL"
        />
      </form>
    </div>
    <div class="mt-4">
      <TheButton type="submit" @click="editProfile" :disabled="editLoading">Save</TheButton>
    </div>
    <LoadingSpinner v-if="editLoading" class="text-center mt-2" />
    <TheAlert v-if="editError" color="red" class="text-center mt-2">
      <div>
        <ExclamationCircleIcon class="size-5 inline" />
        <span class="align-middle ml-1">{{ editError }}</span>
      </div>
    </TheAlert>
  </TheModal>
  <TheModal :open="banOpen" @close="banOpen = false" :title="banLabel">
    <div class="mt-2">
      <form ref="banForm">
        <p v-if="user?.active">
          You are about to ban <b>{{ user?.username }}</b
          >. This will hide this user from the player listing, and their scores from the
          leaderboards. You can unban them at any moment.<br />
        </p>
        <p v-else>
          You are about to unban <b>{{ user?.username }}</b
          >. This will also restore their leaderboard scores.
        </p>
        <b>Are you sure you want to do this?</b>
        <div class="mt-2">
          <FormTextarea v-model="banReason" name="reason" label="Reason" required />
        </div>
        <div class="mt-4">
          <TheButton type="submit" color="red" @click="banUser" :disabled="banLoading"
            >Do it</TheButton
          >
        </div>
        <LoadingSpinner v-if="banLoading" class="text-center mt-2" />
        <TheAlert v-if="banError" color="red" class="text-center mt-2">
          <div>
            <ExclamationCircleIcon class="size-5 inline" />
            <span class="align-middle ml-1">{{ banError }}</span>
          </div>
        </TheAlert>
      </form>
    </div>
  </TheModal>
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
import { computed, ref, toRaw } from 'vue'
import { useRoute } from 'vue-router'
import ThePagination from '@/components/ThePagination.vue'
import { convertedDateTime } from '@/plugins/utils'
import defaultPlayerImg from '../assets/img/avatar.jpg'
import FormInput from '@/components/FormInput.vue'
import { toast } from 'vue-sonner'
import TheModal from '@/components/TheModal.vue'
import FormTextarea from '@/components/FormTextarea.vue'

const loading = ref(true)
const scoreLoading = ref(true)
const error = ref('')
const route = useRoute()
const user = ref(null as IUser | null)
const scores = ref(null as IScoreEntriesResponse | null)

const imgSrc = ref(defaultPlayerImg)
const defaultBannerSrc = "url('https://yarg.in/notes.webp'), url('https://yarg.in/gradient.webp')"
const bannerSrc = ref(defaultBannerSrc)

const editOpen = ref(false)
const editForm = ref()
const editData = ref({
  profilePhotoURL: undefined as string | undefined,
  bannerURL: undefined as string | undefined,
})
const editLoading = ref(false)
const editError = ref('')

const banOpen = ref(false)
const banForm = ref()
const banLoading = ref(false)
const banError = ref('')
const banLabel = computed(() => (user.value?.active ? 'Ban user' : 'Unban user'))
const banReason = ref('')

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
    updateUser(result.data.user)
    fetchScores()
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

function updateUser(result: IUser) {
  user.value = result
  imgSrc.value = user.value.profilePhotoURL ? user.value.profilePhotoURL : defaultPlayerImg
  editData.value.profilePhotoURL = user.value.profilePhotoURL
  bannerSrc.value = user.value.bannerURL
    ? `url('${encodeURI(user.value.bannerURL)}')`
    : defaultBannerSrc
  editData.value.bannerURL = user.value.bannerURL
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

async function editProfile(ev: Event) {
  ev.preventDefault()
  editLoading.value = true
  editError.value = ''
  const params = structuredClone(toRaw(editData.value)) as Record<string, string | undefined>
  if (auth.user && auth.user.admin && user.value?._id != auth.user._id)
    params['id'] = user.value?._id // admin editing someone else
  try {
    const result = await api.post('/user/update', params)
    updateUser(result.data.user)
    toast.success('User updated succesfully!')
    editOpen.value = false
  } catch (e) {
    if (axios.isAxiosError(e) && e.status! < 500) {
      editError.value = e.response?.data.message
    } else {
      console.log(e)
      editError.value = 'An unknown error has occurred.'
    }
  } finally {
    editLoading.value = false
  }
}

async function banUser(ev: Event) {
  ev.preventDefault()
  if (!banForm.value.reportValidity()) return
  banError.value = ''
  banLoading.value = true
  try {
    const result = await api.post('/admin/userBan', {
      id: user.value!._id,
      active: !user.value!.active,
      reason: banReason.value,
    })
    user.value!.active = result.data.active
    toast.success('User updated succesfully!')
    banOpen.value = false
  } catch (e) {
    if (axios.isAxiosError(e) && e.status! < 500) {
      banError.value = e.response?.data.message
    } else {
      console.log(e)
      banError.value = 'An unknown error has occurred.'
    }
  } finally {
    banLoading.value = false
  }
}
</script>

<style scoped>
.banner {
  background-size: cover;
}
</style>

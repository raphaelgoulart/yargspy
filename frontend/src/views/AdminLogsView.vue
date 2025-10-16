<template>
  <h1 class="text-center text-4xl font-bold mb-8">ADMIN ACTION LOGS</h1>
  <div class="w-full my-6 px-2">TODO: log filtering</div>
  <LoadingSpinner v-if="loading" class="text-center" />
  <TheAlert color="red" v-else-if="error" class="text-center"
    ><ExclamationCircleIcon class="size-5 inline" />
    <span class="align-middle ml-1">{{ error }}</span></TheAlert
  >
  <div v-else-if="data && data.entries.length">
    <table class="w-full text-sm text-left rtl:text-right text-gray-400">
      <thead class="text-xs bg-gray-700 text-gray-400">
        <tr>
          <th scope="col" class="pl-3 py-2">When</th>
          <th scope="col">By</th>
          <th scope="col">Action</th>
          <th scope="col" class="pr-3">Affected Item</th>
          <th scope="col">Reason</th>
        </tr>
      </thead>
      <tbody class="text-sm text-slate-300">
        <tr v-for="entry in data.entries" :key="entry._id" class="border-t-1 border-gray-800">
          <td scope="col" class="pl-3 py-2">{{ new Date(entry.createdAt).toLocaleString() }}</td>
          <td scope="col">
            <RouterLink :to="{ name: 'player', params: { username: entry.admin.username } }">{{
              entry.admin.username
            }}</RouterLink>
          </td>
          <td scope="col">{{ getAdminLogAction(entry.action) }}</td>
          <td scope="col" class="pr-3">
            <span
              class="text-white hover:cursor-pointer"
              @click="gotoUser(entry.item)"
              v-if="
                (
                  [AdminAction.UserBan, AdminAction.UserUnban, AdminAction.UserUpdate] as number[]
                ).includes(entry.action)
              "
              >{{ entry.item }}</span
            >
            <RouterLink
              v-else-if="
                ([AdminAction.SongAdd, AdminAction.SongUpdate] as number[]).includes(entry.action)
              "
              :to="{ name: 'leaderboard', params: { id: entry.item } }"
              >{{ entry.item }}</RouterLink
            >
            <span v-else>{{ entry.item }}</span>
          </td>
          <td scope="col">{{ entry.reason }}</td>
        </tr>
      </tbody>
    </table>
    <ThePagination
      class="mt-3"
      :count="data.totalEntries"
      :page="page"
      :limit="limit"
      @page="setPage"
      @size="setLimit"
      :page-sizes="[10, 15, 25, 50, 100]"
    />
  </div>
  <TheAlert color="yellow" v-else class="text-center align-middle"
    ><ExclamationTriangleIcon class="size-5 inline" />
    <span class="ml-1">No items were found using the specified criteria.</span></TheAlert
  >
</template>

<script setup lang="ts">
import ThePagination from '@/components/ThePagination.vue'
import TheAlert from '@/components/TheAlert.vue'
import { ExclamationTriangleIcon, ExclamationCircleIcon } from '@heroicons/vue/20/solid'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import api from '@/plugins/axios'
import axios from 'axios'
import { onMounted, ref } from 'vue'
import { type IAdminLogEntriesResponse, AdminAction } from '@/plugins/types'
import { getAdminLogAction } from '@/plugins/utils'
import { toast } from 'vue-sonner'
import { useRouter } from 'vue-router'

const data = ref(null as IAdminLogEntriesResponse | null)
const loading = ref(true)
const error = ref('')

const page = ref(1)
const limit = ref(15)

const router = useRouter()

onMounted(async () => {
  fetchLogs()
})
async function fetchLogs() {
  loading.value = true
  error.value = ''
  try {
    const params = {
      page: page.value,
      limit: limit.value,
    }
    const result = await api.get('admin/logs', { params })
    data.value = result.data
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

function setPage(i: number) {
  page.value = i
  fetchLogs()
}

function setLimit(i: number) {
  limit.value = i
  fetchLogs()
}

async function gotoUser(id: string) {
  try {
    const result = await api.get('user/idToUsername', { params: { id } })
    router.push({ name: 'player', params: { username: result.data.username } })
  } catch (e) {
    if (axios.isAxiosError(e) && e.status! < 500) {
      toast.error(`An error occurred: ${e.response?.data.message} (${e.response?.status})`)
    } else {
      console.log(e)
      toast.error('An unknown error has occurred.')
    }
  }
}
</script>

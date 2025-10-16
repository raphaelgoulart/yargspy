<template>
  <h1 class="text-center text-4xl font-bold mb-8">ADMIN ACTION LOGS</h1>
  <div class="w-full my-6 px-2">
    <form @submit.prevent="fetchLogs()">
      <div class="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-11 gap-4">
        <div class="col-span-1 md:col-span-4 lg:col-span-2">
          <label class="block text-sm/6 font-medium text-white mb-1">Action</label>
          <FormDropdown :disabled="loading" :items="actionList" v-model="action" />
        </div>
        <div class="col-span-1 md:col-span-4 lg:col-span-2">
          <label class="block text-sm/6 font-medium text-white mb-1">By...</label>
          <FormDropdown :disabled="loading || adminLoading" :items="adminList" v-model="admin" />
        </div>
        <div class="col-span-1 md:col-span-4 lg:col-span-2">
          <FormInput name="item" label="Item" v-model="item" placeholder="ObjectID of item..." />
        </div>
        <div class="col-span-1 md:col-span-5 lg:col-span-2">
          <FormInput name="startDate" type="datetime-local" label="Start" v-model="startDate" />
        </div>
        <div class="col-span-1 md:col-span-5 lg:col-span-2">
          <FormInput name="endDate" type="datetime-local" label="End" v-model="endDate" />
        </div>
        <div class="col-span-1 md:col-span-2 lg:col-span-1 flex items-end">
          <TheButton>Filter</TheButton>
        </div>
      </div>
    </form>
  </div>
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
import { computed, onMounted, ref } from 'vue'
import { type IAdminLogEntriesResponse, AdminAction } from '@/plugins/types'
import { getAdminLogAction } from '@/plugins/utils'
import { toast } from 'vue-sonner'
import { useRouter } from 'vue-router'
import FormInput from '@/components/FormInput.vue'
import FormDropdown from '@/components/FormDropdown.vue'
import TheButton from '@/components/TheButton.vue'

interface IAdminLogsQuery {
  page: number
  limit: number
  action?: number
  admin?: string
  item?: string
  startDate?: string
  endDate?: string
}

const data = ref(null as IAdminLogEntriesResponse | null)
const loading = ref(true)
const error = ref('')

const page = ref(1)
const limit = ref(15)
const action = ref('-1')
const admin = ref('')
const item = ref('')
const startDate = ref('')
const endDate = ref('')

const adminLoading = ref(true)
const admins = ref(null as { _id: string; username: string }[] | null)

const actionList = computed(() => {
  const result: Map<string, string> = new Map()
  result.set('-1', 'All actions')
  for (let i = 0; i <= AdminAction.UserUpdate; i++) {
    result.set(i.toString(), getAdminLogAction(i))
  }
  return result
})

const adminList = computed(() => {
  const result: Map<string, string> = new Map()
  result.set('', 'Anyone')
  for (const i in admins.value) {
    const admin = admins.value[Number(i)]
    result.set(admin!._id, admin!.username)
  }
  return result
})

const router = useRouter()

onMounted(async () => {
  fetchLogs()
  fetchAdmins()
})
async function fetchLogs() {
  loading.value = true
  error.value = ''
  try {
    const params = {
      page: page.value,
      limit: limit.value,
    } as IAdminLogsQuery
    if (action.value != '-1') params.action = Number(action.value)
    if (admin.value) params.admin = admin.value
    if (item.value) params.item = item.value
    if (startDate.value) params.startDate = new Date(startDate.value).toISOString()
    if (endDate.value) params.endDate = new Date(endDate.value).toISOString()
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

async function fetchAdmins() {
  try {
    const result = await api.get('admin/admins')
    admins.value = result.data.entries
  } catch (e) {
    if (axios.isAxiosError(e) && e.status! < 500) {
      toast.error(`Error fetching admin list: ${e.response?.data.message} (${e.response?.status})`)
    } else {
      console.log(e)
      toast.error('An unknown error has occurred while fetching the admin list.')
    }
  } finally {
    adminLoading.value = false
  }
}
</script>

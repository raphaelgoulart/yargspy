<template>
  <header class="absolute inset-x-0 top-0 z-50">
    <nav class="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
      <div class="flex pr-7.5">
        <RouterLink to="/" class="-m-1.5 p-1.5">
          <span class="sr-only">YARGSpy</span>
          <img class="h-8 w-auto" :src="yargspyW" alt="YARGSpy logo" />
        </RouterLink>
      </div>
      <div class="flex lg:hidden">
        <button
          type="button"
          class="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-200"
          @click="mobileMenuOpen = true"
        >
          <span class="sr-only">Open main menu</span>
          <Bars3Icon class="size-6" aria-hidden="true" />
        </button>
      </div>
      <div class="hidden lg:flex lg:gap-x-6">
        <HeaderLink v-for="item in filteredNavigation" :key="item.name" :to="item.to">{{
          item.name
        }}</HeaderLink>
      </div>
      <div class="hidden lg:flex lg:flex-1 lg:justify-end">
        <div v-if="auth.user" class="flex gap-x-6">
          <span class="text-sm/6">
            Welcome,
            <HeaderLink :to="'player/' + auth.user.username">{{ auth.user.username }}</HeaderLink>
          </span>
          <HeaderLink @click="logout"> Log out </HeaderLink>
        </div>
        <HeaderLink to="/login" v-else
          >Log in
          <span aria-hidden="true"
            ><ArrowLongRightIcon class="size-5 inline" aria-hidden="true" /></span
        ></HeaderLink>
      </div>
    </nav>
    <Dialog class="lg:hidden" @close="mobileMenuOpen = false" :open="mobileMenuOpen">
      <div class="fixed inset-0 z-50" />
      <DialogPanel
        class="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-gray-900 p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-100/10"
      >
        <div class="flex items-center justify-between">
          <RouterLink to="/" class="-m-1.5 p-1.5" @click="mobileMenuOpen = false">
            <span class="sr-only">YARGSpy</span>
            <img class="h-8 w-auto" :src="yargspyW" alt="" />
          </RouterLink>
          <button
            type="button"
            class="-m-2.5 rounded-md p-2.5 text-gray-200"
            @click="mobileMenuOpen = false"
          >
            <span class="sr-only">Close menu</span>
            <XMarkIcon class="size-6" aria-hidden="true" />
          </button>
        </div>
        <div class="mt-6 flow-root">
          <div class="-my-6 divide-y divide-white/10">
            <div class="space-y-2 py-6">
              <div v-for="item in filteredNavigation" :key="item.name">
                <HeaderLink @click="mobileMenuOpen = false" :to="item.to" :mobile="true">{{
                  item.name
                }}</HeaderLink>
              </div>
            </div>
            <div class="py-6">
              <HeaderLink to="/login" :mobile="true" v-if="!auth.user">Log in</HeaderLink>
              <HeaderLink @click="logout" :mobile="true" v-else>Log out</HeaderLink>
            </div>
          </div>
        </div>
      </DialogPanel>
    </Dialog>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Dialog, DialogPanel } from '@headlessui/vue'
import { Bars3Icon, XMarkIcon, ArrowLongRightIcon } from '@heroicons/vue/24/outline'
import HeaderLink from './HeaderLink.vue'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue-sonner'
import yargspyW from '../assets/img/yargspy-W.png'

const navigation = [
  { name: 'Players', to: '/player', logged: false },
  { name: 'Leaderboards', to: '/leaderboard', logged: false },
  { name: 'Upload REPLAY File', to: '/upload', logged: true },
  { name: 'About / FAQ', to: '/about', logged: false },
]

const auth = useAuthStore()

const mobileMenuOpen = ref(false)

const filteredNavigation = computed(() => navigation.filter((item) => !item.logged || auth.user))
function logout() {
  auth.logout()
  toast.success('Logged out successfully!')
}
</script>

<template>
  <header class="absolute inset-x-0 top-0 z-1">
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
        <!-- ADMIN ITEMS -->
        <Popover class="relative" v-if="auth.user?.admin" v-slot="{ open }">
          <PopoverButton
            class="flex items-center gap-x-1 text-sm/6 font-semibold text-white hover:text-slate-300 hover:cursor-pointer focus:outline-none"
          >
            Admin
            <ChevronDownIcon
              :class="[open ? 'rotate-180' : '']"
              class="size-5 flex-none text-gray-500"
              aria-hidden="true"
            />
          </PopoverButton>

          <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 translate-y-1"
            enter-to-class="translate-y-0"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="translate-y-0"
            leave-to-class="opacity-0 translate-y-1"
          >
            <PopoverPanel
              class="absolute left-1/2 z-10 mt-3 w-screen max-w-md -translate-x-1/2 overflow-hidden rounded-3xl bg-gray-800 outline-1 -outline-offset-1 outline-white/10"
            >
              <div class="p-4">
                <div
                  v-for="item in adminNavigation"
                  :key="item.name"
                  class="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm/6 hover:bg-white/5"
                >
                  <div
                    class="flex size-11 flex-none items-center justify-center rounded-lg bg-gray-700/50 group-hover:bg-gray-700"
                  >
                    <component
                      :is="item.icon"
                      class="size-6 text-gray-400 group-hover:text-white"
                      aria-hidden="true"
                    />
                  </div>
                  <div class="flex-auto">
                    <RouterLink :to="item.to" class="block font-semibold text-white">
                      {{ item.name }}
                      <span class="absolute inset-0" />
                    </RouterLink>
                  </div>
                </div>
              </div>
            </PopoverPanel>
          </Transition>
        </Popover>
        <!-- -->
      </div>
      <div class="hidden lg:flex lg:flex-1 lg:justify-end">
        <div v-if="auth.user" class="flex gap-x-6">
          <span class="text-sm/6">
            Welcome,
            <HeaderLink :to="'player/' + auth.user.username">{{ auth.user.username }}</HeaderLink>
          </span>
          <HeaderLink @click="logout"> Log out </HeaderLink>
        </div>
        <HeaderLink @click="login" v-else
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
              <Disclosure as="div" class="-mx-3" v-slot="{ open }" v-if="auth.user?.admin">
                <DisclosureButton
                  class="flex w-full items-center justify-between rounded-lg py-2 pr-3.5 pl-3 text-base/7 font-semibold text-white hover:bg-white/5 hover:cursor-pointer"
                >
                  Admin
                  <ChevronDownIcon
                    :class="[open ? 'rotate-180' : '', 'size-5 flex-none']"
                    aria-hidden="true"
                  />
                </DisclosureButton>
                <DisclosurePanel class="mt-2 space-y-2">
                  <RouterLink
                    v-for="item in adminNavigation"
                    :key="item.name"
                    :to="item.to"
                    @click="mobileMenuOpen = false"
                    class="block rounded-lg py-2 pr-3 pl-6 text-sm/7 font-semibold text-white hover:bg-white/5"
                    >{{ item.name }}</RouterLink
                  >
                </DisclosurePanel>
              </Disclosure>
            </div>
            <div class="py-6">
              <HeaderLink
                @click="mobileMenuOpen = false"
                to="/login"
                :mobile="true"
                v-if="!auth.user"
                >Log in</HeaderLink
              >
              <HeaderLink @click="logout" :mobile="true" v-else>Log out</HeaderLink>
            </div>
          </div>
        </div>
      </DialogPanel>
    </Dialog>
  </header>
  <TheModal :open="modalOpen" :title="modalTitle" @close="modalOpen = false">
    <div class="mt-2">
      <LoginForm
        v-if="modalState == 0"
        @register="modalState = 1"
        @forgot-password="modalState = 2"
        @login="modalOpen = false"
      />
      <RegisterForm
        v-else-if="modalState == 1"
        @login="modalState = 0"
        @register="modalState = 0"
      />
      <PasswordForgotForm v-else-if="modalState == 2" @register="modalState = 1" />
    </div>
  </TheModal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Dialog,
  DialogPanel,
  Popover,
  PopoverButton,
  PopoverPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/vue'
import {
  Bars3Icon,
  XMarkIcon,
  ArrowLongRightIcon,
  ChevronDownIcon,
  MusicalNoteIcon,
  DocumentTextIcon,
} from '@heroicons/vue/24/outline'
import HeaderLink from './HeaderLink.vue'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue-sonner'
import yargspyW from '../assets/img/yargspy-W.png'
import { useRoute, useRouter } from 'vue-router'
import TheModal from './TheModal.vue'
import LoginForm from './LoginForm.vue'
import RegisterForm from './RegisterForm.vue'
import PasswordForgotForm from './PasswordForgotForm.vue'

const navigation = [
  { name: 'Players', to: '/player', logged: false },
  { name: 'Leaderboards', to: '/leaderboard', logged: false },
  { name: 'Upload REPLAY File', to: '/upload', logged: true },
  { name: 'About / FAQ', to: '/about', logged: false },
]

const adminNavigation = [
  { name: 'Add Song', to: '/admin/songAdd', icon: MusicalNoteIcon },
  { name: 'Logs', to: '/admin/logs', icon: DocumentTextIcon },
]

const auth = useAuthStore()
const mobileMenuOpen = ref(false)
const filteredNavigation = computed(() => navigation.filter((item) => !item.logged || auth.user))
const route = useRoute()
const router = useRouter()
const modalOpen = ref(false)
const modalState = ref(0) // 0 = login, 1 = register, 2 = forgotpassword
const modalTitle = computed(() => {
  if (modalState.value == 1) return 'Register'
  if (modalState.value == 2) return 'Forgot your password?'
  return 'Log in'
})

function login() {
  if (route.name == 'login' || modalOpen.value) return
  if (['register', 'verify', 'passwordForgot', 'passwordReset'].includes(route.name as string)) {
    router.push('/login')
    return
  }
  modalState.value = 0
  modalOpen.value = true
}

function logout() {
  auth.logout()
  toast.success('Logged out successfully!')
}
</script>

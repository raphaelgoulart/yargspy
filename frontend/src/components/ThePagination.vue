<template>
  <div class="text-center">
    <p class="text-sm">Showing {{ start }} to {{ end }} of {{ count }} items</p>
    <div class="mt-1 text-sm">
      <PaginationButton :disabled="page == 1" @clicked="moveToPage(page - 1)"
        ><ChevronLeftIcon class="size-5 inline"
      /></PaginationButton>
      <PaginationButton
        v-for="i in generatePagination"
        :key="i"
        :active="page == i"
        @clicked="moveToPage(i)"
        >{{ i === undefined ? '...' : i }}</PaginationButton
      >
      <PaginationButton :disabled="page == totalPages" @clicked="moveToPage(page + 1)"
        ><ChevronRightIcon class="size-5 inline"
      /></PaginationButton>
    </div>
    <form
      v-if="pageSelectorOpen"
      class="inline-block text-xs align-top"
      @submit.prevent="moveToPage(pageInput)"
    >
      Page:
      <input
        type="number"
        name="pageInput"
        min="1"
        :max="totalPages"
        v-model="pageInput"
        class="w-12 py-1 px-1 mx-1 my-1 text-xs bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </form>
    <div class="inline-block my-1 align-top">
      <Listbox v-model="selectedPageSize" @update:modelValue="(value) => emit('size', value)">
        <ListboxButton
          class="text-xs w-14 relative rounded-md bg-gray-800 hover:cursor-pointer py-1 pl-2 pr-6 text-left border border-gray-600"
        >
          <span class="block truncate text-white">{{ limit }}</span>
          <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center"
            ><ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
          </span>
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
            class="mt-1 w-full rounded-md bg-gray-800 py-1 text-base text-xs border border-gray-700 text-left"
          >
            <ListboxOption
              v-slot="{ active, selected }"
              v-for="(size, i) in pageSizes"
              :key="i"
              :value="size"
              as="template"
            >
              <li
                :class="[
                  active ? 'bg-gray-700' : '',
                  'relative cursor-default select-none py-1 pl-2',
                ]"
              >
                <span :class="selected ? 'text-white font-bold' : 'text-slate-300'">
                  {{ size }}</span
                >
              </li>
            </ListboxOption>
          </ListboxOptions>
        </Transition>
      </Listbox>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import PaginationButton from './PaginationButton.vue'
import { ChevronLeftIcon, ChevronRightIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid'
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue'

const props = defineProps({
  count: {
    type: Number,
    required: true,
  },
  page: {
    type: Number,
    required: true,
  },
  limit: {
    type: Number,
    required: true,
  },
  pageSizes: {
    type: Array<number>,
    default: [8, 16, 24, 32],
  },
})
const selectedPageSize = ref(props.pageSizes[props.pageSizes.indexOf(props.limit)])
const emit = defineEmits(['page', 'size'])
const pageSelectorOpen = ref(false)
const pageInput = ref(1)

const start = computed(() => {
  return (props.page - 1) * props.limit + 1
})
const end = computed(() => {
  return Math.min(props.page * props.limit, props.count)
})
const totalPages = computed(() => {
  return Math.ceil(props.count / props.limit)
})
const generatePagination = computed(() => {
  if (totalPages.value <= 5) {
    return Array.from({ length: totalPages.value }, (_, i) => i + 1)
  }
  if (props.page <= 3) {
    return [1, 2, 3, undefined, totalPages.value]
  }
  if (props.page >= totalPages.value - 2) {
    return [1, undefined, totalPages.value - 2, totalPages.value - 1, totalPages.value]
  }
  return [1, undefined, props.page - 1, props.page, props.page + 1, undefined, totalPages.value]
})
function moveToPage(page?: number) {
  if (page === undefined) {
    pageSelectorOpen.value = !pageSelectorOpen.value
    pageInput.value = props.page
    return
  }
  if (page < 1 || page > totalPages.value) return
  pageSelectorOpen.value = false
  emit('page', page)
}
</script>

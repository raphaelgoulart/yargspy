<template>
  <Listbox v-model="model">
    <div class="relative block w-full">
      <ListboxButton
        :disabled="disabled"
        class="w-full md:whitespace-nowrap pl-3.5 py-2 text-sm rounded-md hover:cursor-pointer disabled:cursor-not-allowed bg-gray-800 disabled:bg-gray-700 border border-gray-600 text-white disabled:text-gray-400"
      >
        <div class="flex justify-between">
          {{ items.get(model!)
          }}<ChevronDownIcon
            class="h-5 w-5 text-gray-400 inline-block mx-1.5"
            aria-hidden="true"
          />
        </div>
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
          class="absolute z-1 text-left w-full mt-1 rounded-md bg-gray-800 py-1 text-base text-sm border border-gray-700"
        >
          <ListboxOption
            v-slot="{ active, selected, disabled }"
            v-for="[i, label] in items"
            :key="i"
            :value="i"
            :disabled="availableItems && i in availableItems && !availableItems[i]"
            as="template"
          >
            <li
              :class="[
                active ? 'bg-gray-700' : '',
                'relative cursor-default select-none py-1 pl-3.5 pr-2',
              ]"
            >
              <span :class="disabled ? 'text-gray-500' : selected ? 'text-white font-bold' : 'text-slate-300'">
                {{ label }}</span
              >
            </li>
          </ListboxOption>
        </ListboxOptions>
      </Transition>
    </div>
  </Listbox>
</template>

<script setup lang="ts">
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/vue'
import { ChevronDownIcon } from '@heroicons/vue/20/solid'
import { type PropType } from 'vue'

const model = defineModel<string>()
defineProps({
  items: {type: Object as PropType<Map<string,string>>, required: true},
  disabled: {type: Boolean, default: false},
  availableItems: {type: Object as PropType<Record<string,boolean>>}
})

</script>

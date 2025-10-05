<template>
  <button
    class="group w-full flex items-start justify-between gap-6 py-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 rounded-md"
    @click="open = !open"
    :aria-expanded="open"
  >
    <span class="font-medium text-white">
      {{ q }}
    </span>

    <!-- Plus / Minus icon (right-aligned) -->
    <span class="mt-1 shrink-0 text-lg text-white">
      <PlusIcon v-if="!open" class="size-5" aria-hidden="true" />
      <MinusIcon v-else class="size-5" aria-hidden="true" />
    </span>
    <span class="sr-only">Toggle answer</span>
  </button>

  <!-- Collapsible answer -->
  <Transition
    enter-active-class="transition duration-200 ease-out origin-top"
    enter-from-class="opacity-0 scale-y-0"
    enter-to-class="opacity-100 scale-y-100"
    leave-active-class="transition duration-150 ease-in origin-top"
    leave-from-class="opacity-100 scale-y-100"
    leave-to-class="opacity-0 scale-y-0"
  >
    <div v-show="open" class="overflow-hidden will-change-transform" role="region">
      <p class="pb-6 text-slate-300 leading-relaxed">
        <slot></slot>
      </p>
    </div>
  </Transition>
  <hr class="text-gray-700" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { PlusIcon, MinusIcon } from '@heroicons/vue/16/solid'

const props = defineProps({
  q: {
    type: String,
    required: true,
  },
  defaultOpen: {
    type: Boolean,
    default: false,
  },
})
const open = ref(props.defaultOpen)
</script>

<template>
  <div class="flex gap-3">
    <div class="flex h-6 shrink-0 items-center">
      <div class="group grid size-4 grid-cols-1">
        <input
          v-model="model"
          type="checkbox"
          :checked="checked"
          :disabled="disabled"
          :required="required"
          class="col-start-1 row-start-1 appearance-none rounded-sm border border-white/10 bg-white/5 checked:border-blue-500 checked:bg-blue-500 indeterminate:border-blue-500 indeterminate:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:border-white/5 disabled:bg-white/10 disabled:checked:bg-white/10 forced-colors:appearance-auto"
        />
        <svg
          class="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-white/25"
          viewBox="0 0 14 14"
          fill="none"
        >
          <path
            class="opacity-0 group-has-checked:opacity-100"
            d="M3 8L6 11L11 3.5"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            class="opacity-0 group-has-indeterminate:opacity-100"
            d="M3 7H11"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    </div>
    <div class="text-sm/6">
      <label class="font-medium text-white"><slot></slot></label>
    </div>
  </div>
</template>

<script setup lang="ts">
const model = defineModel()
defineProps({
  checked: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
})
</script>

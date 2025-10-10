<template>
  <div class="flex items-center gap-x-3">
    <input
      :name="name"
      type="radio"
      :checked="checked"
      :value="value"
      @change="$emit('update:modelValue', value)"
      class="relative size-4 appearance-none rounded-full border border-white/10 bg-white/5 before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-blue-500 checked:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:border-white/5 disabled:bg-white/10 disabled:before:bg-white/20 forced-colors:appearance-auto forced-colors:before:hidden"
    />
    <label :for="name" class="block text-sm/6 text-white">{{ label }}</label>
  </div>
</template>

<script setup lang="ts">
defineProps({
  name: { type: String, required: true },
  checked: { type: Boolean, default: false },
  label: { type: String, required: true },
  value: String,
})
</script>

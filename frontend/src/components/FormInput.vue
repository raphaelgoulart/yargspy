<template>
  <label :for="name" class="block text-sm/6 font-medium text-white">{{ label }}</label>
  <div class="mt-1">
    <div class="flex items-center rounded-md bg-gray-800 pl-2
    outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2
    focus-within:-outline-offset-1 focus-within:outline-blue-500">
      <slot></slot>
      <input :type="type" :name="name" :autocomplete='autocomplete' :disabled="disabled" v-model="model" :placeholder="placeholder" :required="required" :minlength="minlength" :maxlength="maxlength"
      class="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-white
      placeholder:text-gray-500 focus:outline-none sm:text-sm/6" />
    </div>
  </div>
</template>

<script setup lang="ts">
const model = defineModel()

defineProps({
  name: {type: String, required: true},
  label: {type: String, required: true},
  type: {type: String, default: 'text'},
  autocomplete: String,
  placeholder: String,
  required: {type: Boolean, default: false},
  disabled: {type: Boolean, default: false},
  minlength: String,
  maxlength: String,
})
</script>

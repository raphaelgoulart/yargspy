<template>
    <label :for="name" class="block text-sm/6 font-medium text-white">{{ label }}</label>
    <div class="mt-1">
      <input :name="name" :required="required" :accept="accept" :multiple="multiple" :disabled="disabled"
      class="block file:mr-2 file:py-1.5 file:pl-3 file:pr-2
           file:border-0 file:border-r-1 file:border-white/5
           file:font-medium file:bg-gray-700 file:text-white
           w-full text-sm/6 rounded-md cursor-pointer text-gray-400
           outline-1 -outline-offset-1 outline-white/10
           bg-gray-800 file:cursor-pointer" type="file">
    </div>
</template>

<script setup lang="ts">
defineProps({
  name: {type: String, required: true},
  label: {type: String, required: true},
  required: {type: Boolean, default: false},
  disabled: {type: Boolean, default: false},
  multiple: {type: Boolean, default: false},
  accept: {type: String, default: "*"}
})
</script>

<template>
  <img :src="getFlagSrc" :alt="countryName" :title="countryName" class="inline-block h-[1em] w-auto align-text-bottom" />
</template>

<script setup lang="ts">
import { countryCodes } from '@/plugins/countryCodes'
import { computed } from 'vue'

const props = defineProps({
  code: {type: String, default: 'xx'},
  size: {type: Number, default: 12}
})
const sizes = ['16x12','20x15','24x18','28x21','32x24','36x27','40x30','48x36','56x42',
  '60x45','64x48','72x54','80x60','84x63','96x72','108x81','112x84',
  '120x90','128x96','144x108','160x120','192x144','224x168','256x192']
const unknownFlag = 'data:image/png;base64,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'

const codeLower = computed(() => props.code.toLowerCase())
const getFlagSrc = computed(() => codeLower.value == 'xx' ? unknownFlag : `https://flagcdn.com/${sizes[props.size]}/${codeLower.value}.png`)
const countryName = computed(() => countryCodes[codeLower.value])
</script>

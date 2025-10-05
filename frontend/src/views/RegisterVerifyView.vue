<template>
  <div></div>
</template>

<script setup lang="ts">
import api from '@/plugins/axios';
import router from '@/router';
import axios from 'axios';
import { useRoute } from 'vue-router';
import { toast } from 'vue-sonner';

const route = useRoute()
const token = route.params.token as string

validate()
async function validate() {
  try {
    await api.get('user/emailVerify', { params: { token } })
    toast.success('Account validated successfully!')
    router.push('/login')
  } catch (e) {
    if (axios.isAxiosError(e) && e.status! < 500) {
      toast.error(e.response?.data.message)
    } else {
      console.log(e)
      toast.error('An unknown error has occurred.')
    }
    router.push('/')
  }
}
</script>

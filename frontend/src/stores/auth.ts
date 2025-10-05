import api from '@/plugins/axios';
import type { IUser } from '@/plugins/types';
import { defineStore } from 'pinia'
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null as IUser | null)
  const returnUrl = ref(null as string | null)
  const initialized = ref(false)
  const loading = ref(false)

  async function refreshUser(token: string | null) {
    if (!token) return null
    try {
      const result = await api.get('user/profile')
      user.value = result.data.user as IUser
    } catch { // invalid token
      localStorage.removeItem('token')
      user.value = null
    }
  }
  async function init() {
    if (initialized.value) return
    loading.value = true
    try {
      await refreshUser(localStorage.getItem('token'))
    } finally {
      loading.value = false
      initialized.value = true
    }
  }
  async function login(token: string) {
    localStorage.setItem('token',token);
    await refreshUser(token)
  }
  function logout() {
    user.value = null;
    localStorage.removeItem('token');
  }

  return { user, returnUrl, initialized, loading, init, refreshUser, login, logout }
})

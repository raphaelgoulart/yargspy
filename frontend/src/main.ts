import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
await auth.init()
app.mount('#app')

// system-wide: kick user from restricted page if they logout while using it
import { watch } from 'vue'

watch(
  () => auth.user,
  (user) => {
    const requiresAuth = router.currentRoute.value.meta?.requiresAuth || router.currentRoute.value.meta?.requiresAdmin
    if (requiresAuth && !user) {
      auth.returnUrl = router.currentRoute.value.fullPath
      router.replace('/login')
    }
  }
)

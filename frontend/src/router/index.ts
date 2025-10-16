import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import StandardView from '../views/StandardView.vue'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue-sonner'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/player',
      component: StandardView,
      children: [
        { path: '', name: 'players', component: () => import('../views/PlayerListView.vue') },
      ],
    },
    {
      path: '/player/:username',
      name: 'player',
      component: () => import('../views/PlayerView.vue'),
    },
    {
      path: '/leaderboard',
      component: StandardView,
      children: [
        {
          path: '',
          name: 'leaderboards',
          component: () => import('../views/LeaderboardListView.vue'),
        },
        {
          path: ':id',
          name: 'leaderboard',
          component: () => import('../views/LeaderboardView.vue'),
        },
      ],
    },
    {
      path: '/upload',
      component: StandardView,
      children: [
        {
          path: '',
          name: 'upload',
          component: () => import('../views/UploadView.vue'),
          meta: { requiresAuth: true },
        },
      ],
    },
    {
      path: '/login',
      component: StandardView,
      children: [
        {
          path: '',
          name: 'login',
          component: () => import('../views/LoginView.vue'),
          meta: { noAuth: true },
        },
      ],
    },
    {
      path: '/register',
      component: StandardView,
      children: [
        {
          path: '',
          name: 'register',
          component: () => import('../views/RegisterView.vue'),
          meta: { noAuth: true },
        },
        {
          path: ':token',
          name: 'verify',
          component: () => import('../views/RegisterVerifyView.vue'),
          meta: { noAuth: true },
        },
      ],
    },
    {
      path: '/passwordReset',
      component: StandardView,
      children: [
        {
          path: '',
          name: 'passwordForgot',
          component: () => import('../views/PasswordForgotView.vue'),
          meta: { noAuth: true },
        },
        {
          path: ':token',
          name: 'passwordReset',
          component: () => import('../views/PasswordResetView.vue'),
          meta: { noAuth: true },
        },
      ],
    },
    {
      path: '/about',
      component: StandardView,
      children: [{ path: '', name: 'about', component: () => import('../views/AboutView.vue') }],
    },
    {
      path: '/tospp',
      component: StandardView,
      children: [{ path: '', name: 'tospp', component: () => import('../views/ToSPPView.vue') }],
    },
    // admin routes
    {
      path: '/admin',
      component: StandardView,
      meta: { requiresAdmin: true },
      children: [
        {
          path: 'songAdd',
          name: 'adminSongAdd',
          component: () => import('../views/AdminSongAddView.vue'),
        },
        { path: 'logs', name: 'adminLogs', component: () => import('../views/AdminLogsView.vue') },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!auth.initialized) {
    await auth.init()
  }

  const requiresAuth = to.meta?.requiresAuth
  const noAuth = to.meta?.noAuth
  const requiresAdmin = to.meta?.requiresAdmin

  if ((requiresAuth || requiresAdmin) && !auth.user) {
    toast.warning('You need to be logged in to see this page!')
    auth.returnUrl = to.fullPath
    return { path: '/login', replace: true }
  }

  if (noAuth && auth.user) {
    toast.warning("You're already logged in!")
    return { path: '/', replace: true }
  }

  if (requiresAdmin && (!auth.user || !auth.user.admin)) {
    toast.warning('You need to be an administrator to see this page!')
    return { path: '/', replace: true }
  }
})

export default router

import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import BoardsView from '@/views/BoardsView.vue'
import { useAuthStore } from '@/stores/auth'
import { watch } from 'vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/boards',
      name: 'boards',
      component: BoardsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/boards/:id',
      name: 'board',
      component: () => import('../views/BoardView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// Navigation guard amélioré
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const authStore = useAuthStore()

  // Attendre que l'authentification soit prête
  if (!authStore.authReady) {
    await new Promise((resolve) => {
      const unwatch = watch(
        () => authStore.authReady,
        (ready) => {
          if (ready) {
            unwatch()
            resolve()
          }
        },
      )
    })
  }

  // Maintenant que authReady est vrai, on peut vérifier l'utilisateur
  if (requiresAuth && !authStore.user) {
    next('/login')
  } else {
    next()
  }
})

export default router

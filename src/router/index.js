import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { auth } from '../firebase'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import BoardsView from '@/views/BoardsView.vue'

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
    },
    {
      path: '/boards/:id',
      name: 'board',
      component: () => import('../views/BoardView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// Navigation guard pour vérifier l'authentification
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const isAuthenticated = auth.currentUser

  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router

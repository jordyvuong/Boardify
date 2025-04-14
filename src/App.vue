<template>
  <div id="app">
    <header v-if="showHeader">
      <nav class="navbar">
        <div class="navbar-brand">
          <router-link to="/">
            <h1 class="logo">Boardify</h1>
          </router-link>
        </div>
        <div class="navbar-menu">
          <div v-if="authStore.user" class="navbar-start">
            <router-link to="/boards" class="navbar-item">Mes tableaux</router-link>
          </div>
          <div class="navbar-end">
            <div v-if="authStore.user" class="user-menu">
              <div class="search-box">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  v-model="searchQuery"
                  @input="handleSearch"
                />
              </div>
              <div class="user-info">
                <span class="user-email">{{ authStore.user.email }}</span>
                <button class="logout-button" @click="handleLogout">Déconnexion</button>
              </div>
            </div>
            <div v-else class="auth-links">
              <router-link to="/login" class="navbar-item">Connexion</router-link>
              <router-link to="/register" class="navbar-item">Inscription</router-link>
            </div>
          </div>
        </div>
      </nav>
    </header>

    <main>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer v-if="showFooter" class="footer">
      <div class="footer-content">
        <p>&copy; {{ new Date().getFullYear() }} Boardify - Clone de Trello</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const searchQuery = ref('')

// Initialiser l'état d'authentification au chargement de l'app
onMounted(() => {
  authStore.init()
})

// Calculer si l'en-tête doit être affiché (sur toutes les pages sauf login et register)
const showHeader = computed(() => {
  return !['login', 'register'].includes(route.name)
})

// Calculer si le pied de page doit être affiché
const showFooter = computed(() => {
  return !['board'].includes(route.name)
})

// Gérer la déconnexion
const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

// Gérer la recherche
const handleSearch = () => {
  if (searchQuery.value.trim().length > 2) {
    router.push({
      name: 'search',
      query: { q: searchQuery.value },
    })
  }
}

// Vider la recherche quand on change de route
watch(
  () => route.name,
  () => {
    searchQuery.value = ''
  },
)
</script>

<style>
/* Reset de base et styles globaux */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  width: 100%;
  height: 100%;
}

body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #172b4d;
  background-color: #f4f5f7;
}

#app {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Navbar */
header {
  width: 100%;
}

.navbar {
  width: 100%;
  background-color: #026aa7;
  color: white;
  padding: 0.8rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.navbar-brand a {
  text-decoration: none;
}

.logo {
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
}

.navbar-menu {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-grow: 1;
  margin-left: 2rem;
}

.navbar-start,
.navbar-end {
  display: flex;
  align-items: center;
}

.navbar-item {
  color: white;
  margin: 0 0.8rem;
  text-decoration: none;
  font-weight: 500;
  padding: 0.3rem 0.6rem;
  border-radius: 3px;
  transition: background-color 0.2s;
}

.navbar-item:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.user-menu {
  display: flex;
  align-items: center;
}

.search-box {
  margin-right: 1rem;
}

.search-box input {
  padding: 0.4rem 0.8rem;
  border-radius: 3px;
  border: none;
  font-size: 0.9rem;
  width: 220px;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-email {
  margin-right: 1rem;
  font-size: 0.9rem;
}

.logout-button {
  background-color: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.logout-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.auth-links {
  display: flex;
}

/* Main content */
main {
  flex: 1;
  width: 100%;
  overflow-x: hidden;
}

/* Footer */
footer {
  width: 100%;
}

.footer {
  background-color: #f4f5f7;
  border-top: 1px solid #dfe1e6;
  padding: 1rem;
  text-align: center;
  font-size: 0.9rem;
  color: #6b778c;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

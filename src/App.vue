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
                  @keydown.enter="handleSearch"
                />
                <span class="search-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                </span>
              </div>
              <div class="user-profile">
                <div class="dropdown">
                  <div class="dropdown-trigger">
                    <div class="user-avatar-container">
                      <img
                        v-if="authStore.user.photoURL"
                        :src="authStore.user.photoURL"
                        alt="Profil"
                        class="user-avatar"
                      />
                      <div v-else class="user-avatar-fallback">
                        {{ getUserInitials() }}
                      </div>
                      <span class="user-displayname">{{ authStore.user.displayName }}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="dropdown-arrow"><path d="m6 9 6 6 6-6"></path></svg>
                    </div>
                  </div>
                  <div class="dropdown-menu">
                    <router-link to="/edit-profile" class="dropdown-item">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg>
                      Modifier le profil
                    </router-link>
                    <div class="dropdown-divider"></div>
                    <button class="dropdown-item logout-button" @click="handleLogout">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg>
                      Déconnexion
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="auth-links">
              <router-link to="/login" class="auth-button login-button">Connexion</router-link>
              <router-link to="/register" class="auth-button register-button">Inscription</router-link>
            </div>
          </div>
        </div>
      </nav>
    </header>

    <main>
      <router-view v-slot="{ Component }">
  <transition name="fade" mode="out-in">
    <!-- Ajouter une clé unique basée sur la query -->
    <component :is="Component" :key="$route.query.q" />
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
import { searchItems } from './stores/boards'  // Importer la fonction de recherche

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const searchQuery = ref('')
const results = ref([]);

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
const handleSearch = (event) => {
  event.preventDefault();  // Empêcher la soumission par défaut si l'input est dans un formulaire (si applicable)
 
  
  if (searchQuery.value.trim().length > 0) {  // Assurer que l'utilisateur a tapé au moins 3 caractères
    router.push({
      name: 'search',  // Cette route que nous avons définie pour la recherche
      query: { q: searchQuery.value },  // Passer le texte de la recherche dans l'URL
    });
  }
};

// Obtenir les initiales de l'utilisateur pour l'avatar de secours
const getUserInitials = () => {
  if (!authStore.user || !authStore.user.displayName) return '?'
  
  return authStore.user.displayName
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

// Vider la recherche quand on change de route
watch(
  () => route.query.q,
  async (newQuery) => {
    if (newQuery) {
      searchQuery.value = newQuery;
      results.value = await searchItems(newQuery);  // Appeler searchItems pour mettre à jour les résultats
    }
  }
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  padding: 0.5rem 0.8rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.navbar-item:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.user-menu {
  display: flex;
  align-items: center;
}

/* Barre de recherche améliorée */
.search-box {
  position: relative;
  margin-right: 1.5rem;
}

.search-box input {
  padding: 0.5rem 0.8rem 0.5rem 2.2rem;
  border-radius: 4px;
  border: none;
  font-size: 0.9rem;
  width: 220px;
  background-color: rgba(255, 255, 255, 0.3);
  color: white;
  transition: background-color 0.2s;
}

.search-box input::placeholder {
  color: rgba(255, 255, 255, 0.8);
}

.search-box input:focus {
  background-color: white;
  color: #172b4d;
  outline: none;
}

.search-box input:focus::placeholder {
  color: #6b778c;
}

.search-icon {
  position: absolute;
  left: 0.6rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.8);
  pointer-events: none;
}

.search-box input:focus + .search-icon {
  color: #6b778c;
}

/* Profil utilisateur amélioré */
.user-profile {
  position: relative;
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-trigger {
  cursor: pointer;
}

.user-avatar-container {
  display: flex;
  align-items: center;
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.user-avatar-container:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.user-avatar-fallback {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #0079bf;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.user-displayname {
  margin: 0 0.6rem;
  font-weight: 500;
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-arrow {
  transition: transform 0.2s;
}

.dropdown:hover .dropdown-arrow {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 100;
  display: none;
  overflow: hidden;
}

.dropdown:hover .dropdown-menu {
  display: block;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 0.8rem 1rem;
  color: #172b4d;
  text-decoration: none;
  transition: background-color 0.2s;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
}

.dropdown-item svg {
  margin-right: 0.8rem;
  color: #6b778c;
}

.dropdown-item:hover {
  background-color: #f4f5f7;
}

.dropdown-divider {
  height: 1px;
  background-color: #dfe1e6;
  margin: 0.3rem 0;
}

.logout-button {
  color: #c9372c;
}

.logout-button svg {
  color: #c9372c;
}

/* Boutons d'authentification */
.auth-links {
  display: flex;
  gap: 0.8rem;
}

.auth-button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.login-button {
  background-color: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.login-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: white;
}

.register-button {
  background-color: white;
  color: #026aa7;
}

.register-button:hover {
  background-color: #f4f5f7;
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

/* Responsive */
@media (max-width: 768px) {
  .navbar-menu {
    margin-left: 1rem;
  }
  
  .search-box input {
    width: 160px;
  }
  
  .user-displayname {
    max-width: 100px;
  }
}

@media (max-width: 576px) {
  .navbar {
    padding: 0.6rem 1rem;
  }
  
  .search-box {
    margin-right: 0.8rem;
  }
  
  .search-box input {
    width: 120px;
  }
  
  .user-displayname {
    display: none;
  }
  
  .auth-button {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
}
</style>
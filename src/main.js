import './assets/main.css'

import { createApp } from 'vue'
import { VueFire, VueFireAuth } from 'vuefire'
import { firebaseApp } from './firebase'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(VueFire, {
  firebaseApp,
  modules: [VueFireAuth()],
})

app.use(router)
app.use(pinia)

const authStore = useAuthStore()
authStore.init()

app.mount('#app')

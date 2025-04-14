import './assets/main.css'

import { createApp } from 'vue'
import { VueFire, VueFireAuth } from 'vuefire'
import { firebaseApp } from './firebase'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

const app = createApp(App)
const pinia = createPinia()

app.use(VueFire, {
  firebaseApp,
  modules: [VueFireAuth()],
})

app.use(router)
app.use(pinia)
app.mount('#app')

import { createApp } from 'vue'
import { Quasar } from 'quasar'


// Import Quasar css
import 'quasar/dist/quasar.css'

// Assumes your root component is App.vue
// and placed in same folder as main.js
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import './assets/styles.css'

import { useAuthStore } from './stores/auth'
import {connectToNotifications} from './websocket/wsClient.js'

import {toast} from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const myApp = createApp(App)

myApp.use(toast, {
  autoClose: 2000,
  position: "top-right",
})

myApp.use(Quasar, {
  plugins: {}, // import Quasar plugins and add here
})

myApp.use(router)

const pinia = createPinia()
myApp.use(pinia)

// Try to reconnect WebSocket if user is already authenticated
const auth = useAuthStore()
if (auth.token) {
  connectToNotifications(auth.token)
}

// Assumes you have a <div id="app"></div> in your index.html
myApp.mount('#app')


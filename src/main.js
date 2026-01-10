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

const myApp = createApp(App)


myApp.use(Quasar, {
  plugins: {}, // import Quasar plugins and add here
})

myApp.use(router)

const pinia = createPinia()
myApp.use(pinia)

// Assumes you have a <div id="app"></div> in your index.html
myApp.mount('#app')
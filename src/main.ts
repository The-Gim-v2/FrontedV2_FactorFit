import './assets/main.css'
import './assets/mobile-performance.css'
import { pauseOffscreenAnimations } from './landing/components/Pauseoffscreenanimations'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
pauseOffscreenAnimations()

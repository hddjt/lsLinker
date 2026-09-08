import { createApp } from 'vue'
import router from './router'
import { tilt } from './utils/tilt'
import './style.css'
import App from './App.vue'

const app = createApp(App)
app.use(router)
app.directive('tilt', tilt)
app.mount('#app')

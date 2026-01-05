import { createApp } from 'vue'
import App from './App.vue'
import Vue3WaveAudioPlayer from '../main'

const app = createApp(App)

app.use(Vue3WaveAudioPlayer)
app.mount('#app')

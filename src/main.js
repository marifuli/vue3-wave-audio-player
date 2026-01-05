import Vue3WaveAudioPlayer from './components/Vue3WaveAudioPlayer.vue'

// Optional: allow app.use(Vue3WaveAudioPlayer)
Vue3WaveAudioPlayer.install = (app) => {
  app.component(
    Vue3WaveAudioPlayer.name || 'Vue3WaveAudioPlayer',
    Vue3WaveAudioPlayer
  )
}

export default Vue3WaveAudioPlayer

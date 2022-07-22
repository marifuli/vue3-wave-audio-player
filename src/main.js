import Vue3WaveAudioPlayer from './components/Vue3WaveAudioPlayer.vue'

Vue3WaveAudioPlayer.install = (Vue) => {
  Vue.component(Vue3WaveAudioPlayer.name, Vue3WaveAudioPlayer)
}

export default Vue3WaveAudioPlayer
// import { createApp } from "vue"
// import App from "./App.vue"
// createApp(App).mount("#app")
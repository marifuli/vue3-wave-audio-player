import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig(({ command }) => ({
  plugins: [vue()],

  root: command === 'serve' ? 'src/dev' : process.cwd(),

  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/main.js'),
      name: 'Vue3WaveAudioPlayer',
      fileName: (format) => `vue3-wave-audio-player.${format}.js`
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: { vue: 'Vue' }
      }
    }
  }
}))

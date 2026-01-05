<template>
  <div style="max-width: 250px">
    <Vue3WaveAudioPlayer
      :wave_width="250"
      :wave_height="40"
      wave_type="mirror"
      src="hello_world.ogg"
    />

    <Vue3WaveAudioPlayer
      :wave_width="250"
      :wave_height="40"
      :wave_options="{ samples: 50 }"
      src="hello_world.ogg"
      :load_audio_onmount="false"
    />
  </div>
</template>

<script>
import Vue3WaveAudioPlayer from '../main'

export default {
  components: {
    Vue3WaveAudioPlayer
  }
}
</script>

# Vue 3 wave-audio-player

![Image demo](https://github.com/marifuli/vue3-wave-audio-player/raw/master/preview.png)

## NPM install :
```
npm i vue3-wave-audio-player
```

### Import ans use: 
```
<template>
  <div style="max-width: 250px">
    <Vue3WaveAudioPlayer
    :wave_width="250"
    :wave_height="40"
    wave_type="mirror"
    src="/samples/file.mp3"
    />  
    <!-- optional wave_options -->
    <Vue3WaveAudioPlayer
    :wave_width="250"
    :wave_height="40"
    :wave_options='{"samples":50}' 
    src="/samples/file.mp3"
    :load_audio_onmount="false"
    />  
    <Vue3WaveAudioPlayer
    :wave_width="250"
    :wave_height="40"
    :wave_options='{"samples":40,"type":"steps","width":192,"height":40}'
    src="/samples/file.mp3"
    />   
  </div>
</template>
<script>
import Vue3WaveAudioPlayer from 'vue3-wave-audio-player'

export default {
  name: 'App',
  components: {
    Vue3WaveAudioPlayer
  },
}
</script>
```
### Attributes
Name | Required | Type | Description
--- | --- | --- | --- 
src | True | audio file | Source path to audio file
wave_width | True | Integer | Width of the Waves. (Not responsive, Also remember that the buttons and the timing strings will take extra ~250px. For example, if(container === 500px) => wave_width = 500 - 250 = 250  )
wave_height | True | Integer | Height of the waves (Not Responsive)
wave_type | False | String | Type of wave. (Not working yet)
wave_options | False | Object | Set settings for the waves (Not working yet)
load_audio_onmount | False | Boolean | Load the path and audio data on mounted
disable_seeking | False | Boolean | Disable time seeking

### Events
I have added all the events that html has in the audio tag with a "on_" prefix.
Additional events:
Name | Required | Type | Return | Description
--- | --- | --- | --- | ---  
tried_to_seek | False | Func  | Boolean | Triggered when user try to seek time
```
// Example 
<Vue3WaveAudioPlayer
:wave_width="250"
:wave_height="40"
src="/samples/file.mp3"

@on_error="onError"
@on_ended="customCallback" // ... many more
/> 
```
Check [MDN Doc](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio) for all the events.

### Report bug or Suggestion
please send a mail at imdarif122@mail.com or contact@arifdev.com. 
You can also open any issue in the [GitHub](https://github.com/marifuli/vue3-wave-audio-player) page. Thanks for using this package.

### Inspired by:
[wave-path-audio-player](https://www.npmjs.com/package/wave-audio-path-player) package
[waveform-path](https://jerosoler.github.io/waveform-path) package
 

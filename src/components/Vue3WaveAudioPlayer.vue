<template>
  <div part="player" ref="player" class="player">
    <button
      id="play"
      part="play"
      ref="play"
      v-if="loading_audio_data"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        style="margin: auto; background: rgba(255, 255, 255, 0); display: block; shape-rendering: auto"
        width="34px"
        height="34px"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid"
      >
        <circle
          cx="50"
          cy="50"
          fill="none"
          stroke="#858a8d"
          stroke-width="10"
          r="35"
          stroke-dasharray="164.93361431346415 56.97787143782138"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            repeatCount="indefinite"
            dur="1s"
            values="0 50 50;360 50 50"
            keyTimes="0;1"
          ></animateTransform>
        </circle>
      </svg>
    </button>
    <button
      id="play"
      part="play"
      ref="play"
      v-else
      @click="playPause"
    >
      <svg
        viewBox="0 0 34 34"
        width="34"
        height="34"
        part="button"
        ref="button"
      >
        <path
          id="playPathButton"
          :d="audio_paused ? playPath : pausePath"
        ></path>
      </svg>
    </button>
    <div id="current-time" part="currenttime" ref="currenttime">
      {{ currentTimeContainer_textContent }}
    </div>
    <div id="slider" part="slider" ref="slider">
      <svg
        id="svg"
        part="svg"
        ref="svg"
        xmlns="http://www.w3.org/2000/svg"
        :viewBox="'0 0 ' + wave_width + ' ' + wave_height"
        :width="wave_width"
        :height="wave_height"
      >
        <defs>
          <clipPath :id="clipPathX">
            <rect
              x="-1"
              y="-100"
              :width="wave_width + 2"
              :height="wave_height + 200"
            >
              <animate
                id="animationsvgx"
                ref="animationsvgx"
                attributeName="x"
                :values="'-1;' + (wave_width + 2)"
                :dur="animationsvgx_dur"
                fill="freeze"
              />
            </rect>
          </clipPath>
          <clipPath :id="clipPathA">
            <rect
              :x="-1 * (wave_width + 2)"
              y="-100"
              :width="wave_width + 2"
              :height="wave_height + 200"
            >
              <animate
                id="animationsvg"
                ref="animationsvg"
                attributeName="x"
                :values="animationsvg_val"
                :dur="animationsvg_dur"
                fill="freeze"
              />
            </rect>
          </clipPath>
        </defs>
        <path
          id="path1"
          ref="path1"
          stroke-width="2"
          :d="path1_d"
          :clip-path="'url(#' + clipPathX + ')'"
        ></path>
        <path
          id="path2"
          ref="path2"
          stroke-width="2"
          :d="path2_d"
          :clip-path="'url(#' + clipPathA + ')'"
          :style="{ display: path2_display }"
        ></path>
      </svg>
      <input
        type="range"
        part="input"
        id="seek-slider"
        max="100"
        value="0"
        step="any"
        :style="{
          height: wave_height + 'px'
        }"
        @input="sliderInput"
        @change="sliderChange"
      />
    </div>
    <div id="duration" part="duration">{{ durationContainer_textContent }}</div>
  </div>

  <audio
    ref="audio_tag"
    @ended="onFinish"
    @abort="$emit('on_abort', $event)"
    @canplay="$emit('on_canplay', $event)"
    @canplaythrough="$emit('on_canplaythrough', $event)"
    @durationchange="$emit('on_durationchange', $event)"
    @emptied="$emit('on_emptied', $event)"
    @error="$emit('on_error', $event)"
    @loadeddata="$emit('on_loadeddata', $event)"
    @loadstart="$emit('on_loadstart', $event)"
    @pause="$emit('on_pause', $event)"
    @play="$emit('on_play', $event)"
    @playing="$emit('on_playing', $event)"
    @progress="$emit('on_progress', $event)"
    @ratechange="$emit('on_ratechange', $event)"
    @seeked="$emit('on_seeked', $event)"
    @seeking="$emit('on_seeking', $event)"
    @stalled="$emit('on_stalled', $event)"
    @suspend="$emit('on_suspend', $event)"
    @timeupdate="$emit('on_timeupdate', $event)"
    @volumechange="$emit('on_volumechange', $event)"
    @waiting="$emit('waiting', $event)"
  ></audio>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeMount, watch } from 'vue'

// Types
interface PathConfig {
  d: string
  sx?: number
  sy?: number
  x?: number
  y?: number
  ex?: number
  ey?: number
  sr?: number
  er?: number
  r?: number
  rx?: number
  ry?: number
  angle?: number
  arc?: number
  sweep?: number
  sdeg?: number
  edeg?: number
  deg?: number
  minshow?: number
  maxshow?: number
  normalize?: boolean
}

interface PlayerOptions {
  samples: number
  type: string | null
  width: number | null
  height: number | null
  paths: PathConfig[]
  channel: number
  top: number
  left: number
  animation: boolean
  animationframes: number
  normalize: boolean
    distance: number  
    length: number
    startdeg: number
    enddeg: number
    invertdeg: boolean
    invertpath: boolean
}

interface Props {
  wave_width?: number
  src?: string
  wave_height?: number
  wave_options?: {
    samples?: number
    width?: number
    height?: number
  }
  wave_animation?: boolean
  wave_type?: string
  load_audio_onmount?: boolean
  disable_seeking?: boolean
}

interface Emits {
  (e: 'tried_to_seek', value: boolean): void
  (e: 'waiting', event: Event): void
  (e: 'on_volumechange', event: Event): void
  (e: 'on_timeupdate', event: Event): void
  (e: 'on_suspend', event: Event): void
  (e: 'on_stalled', event: Event): void
  (e: 'on_seeking', event: Event): void
  (e: 'on_seeked', event: Event): void
  (e: 'on_ratechange', event: Event): void
  (e: 'on_progress', event: Event): void
  (e: 'on_playing', event: Event): void
  (e: 'on_play', event: Event): void
  (e: 'on_pause', event: Event): void
  (e: 'on_loadstart', event: Event): void
  (e: 'on_loadeddata', event: Event): void
  (e: 'on_error', error: any): void
  (e: 'on_emptied', event: Event): void
  (e: 'on_durationchange', event: Event): void
  (e: 'on_canplaythrough', event: Event): void
  (e: 'on_canplay', event: Event): void
  (e: 'on_abort', event: Event): void
  (e: 'on_loadedmetadata', event: Event): void
  (e: 'on_ended', event: Event): void
}

// Props and Emits
const props = withDefaults(defineProps<Props>(), {
  wave_width: 200,
  src: undefined,
  wave_height: 40,
  wave_options: undefined,
  wave_animation: false,
  wave_type: 'mirror',
  load_audio_onmount: true,
  disable_seeking: false
})

const emit = defineEmits<Emits>()

// Refs
const player = ref<HTMLDivElement | null>(null)
const play = ref<HTMLButtonElement | null>(null)
const button = ref<SVGElement | null>(null)
const currenttime = ref<HTMLDivElement | null>(null)
const slider = ref<HTMLDivElement | null>(null)
const svg = ref<SVGSVGElement | null>(null)
const path1 = ref<SVGPathElement | null>(null)
const path2 = ref<SVGPathElement | null>(null)
const animationsvg = ref<SVGAnimateElement | null>(null)
const animationsvgx = ref<SVGAnimateElement | null>(null)
const audio_tag = ref<HTMLAudioElement | null>(null)
const seek_slider = ref<HTMLInputElement | null>(null)

// Data
const animation = ref<boolean>(false)
const player_options = ref<PlayerOptions>({
  samples: 40,
  type: null,
  width: null,
  height: null,
  paths: [{ d: 'V', sy: 0, x: 50, ey: 100 }],
  channel: 0,
  top: 0,
  left: 0,
  animation: false,
  animationframes: 10,
  normalize: true,
    distance: 50,
    length: 100,
    startdeg: 0,
    enddeg: 360,
    invertdeg: false,
    invertpath: false,
})

const playPath = "M8.5 8.7c0-1.7 1.2-2.4 2.6-1.5l14.4 8.3c1.4.8 1.4 2.2 0 3l-14.4 8.3c-1.4.8-2.6.2-2.6-1.5V8.7z"
const pausePath = "M9.2 25c0 .5.4 1 .9 1h3.6c.5 0 .9-.4.9-1V9c0-.5-.4-.9-.9-.9h-3.6c-.4-.1-.9.3-.9.9v16zm11-17c-.5 0-1 .4-1 .9V25c0 .5.4 1 1 1h3.6c.5 0 1-.4 1-1V9c0-.5-.4-.9-1-.9 0-.1-3.6-.1-3.6-.1z"

// Element references
const playPathButton = ref<SVGPathElement | null>(null)
const durationContainer = ref<HTMLDivElement | null>(null)
const currentTimeContainer = ref<HTMLDivElement | null>(null)
const playIconContainer = ref<HTMLButtonElement | null>(null)
const seekSlider = ref<HTMLInputElement | null>(null)

// Audio and animation
const audio = ref<HTMLAudioElement | null>(null)
const raf = ref<number | null>(null)
const audioData = ref<AudioBuffer | null>(null)
const audioContext = ref<AudioContext | null>(null)
const audioSource = ref<AudioBufferSourceNode | null>(null)

// Reactive state
const durationContainer_textContent = ref<string>('0:00')
const currentTimeContainer_textContent = ref<string>('0:00')
const animationsvg_dur = ref<string>('999s')
const animationsvgx_dur = ref<string>('999s')
const audio_paused = ref<boolean>(true)
const path2_display = ref<string>('block')
const path1_d = ref<string | undefined>(undefined)
const path2_d = ref<string | undefined>(undefined)
const audioPathLoaded = ref<boolean>(false)
const animationsvg_val = ref<string>('')
const clipPathX = ref<string>('left-to-right-x')
const clipPathA = ref<string>('left-to-right')
const loading_audio_data = ref<boolean>(false)
const loaded_audio_data = ref<boolean>(false)

onBeforeMount(() => {
  // Setting up the options
  player_options.value.width = props.wave_width
  player_options.value.height = props.wave_height
  player_options.value.type = props.wave_type
  
  if (props.wave_options) {
    if (props.wave_options.samples) {
      player_options.value.samples = props.wave_options.samples
    }
    if (props.wave_options.width) {
      player_options.value.width = props.wave_options.width
    }
    if (props.wave_options.height) {
      player_options.value.height = props.wave_options.height
    }
  }
  
  if (props.wave_animation) {
    animation.value = props.wave_animation
  }
  
  // Finish settings
  clipPathX.value += '-' + Math.random().toString(36).slice(2)
  clipPathA.value += '-' + Math.random().toString(36).slice(2)

  audioContext.value = new AudioContext()
  audioSource.value = audioContext.value.createBufferSource()
})

onMounted(() => {
  if (!player.value) return
  
  playPathButton.value = player.value.querySelector('#playPathButton')
  svg.value = player.value.querySelector('#svg')
  path1.value = player.value.querySelector('#path1')
  path2.value = player.value.querySelector('#path2')
  animationsvg.value = player.value.querySelector('#animationsvg')
  animationsvgx.value = player.value.querySelector('#animationsvgx')
  audio.value = audio_tag.value
  durationContainer.value = player.value.querySelector('#duration')
  seekSlider.value = player.value.querySelector('#seek-slider')
  currentTimeContainer.value = player.value.querySelector('#current-time')
  playIconContainer.value = player.value.querySelector('#play')

  if (svg.value) {
    svg.value.pauseAnimations()
  }
  
  animationsvg_val.value = '-' + (props.wave_width + 2) + ';-1'
  
  if (props.load_audio_onmount && props.src) {
    runAudioPath()
  }
})

// Watch for src changes
watch(() => props.src, (newSrc) => {
  if (newSrc) {
    loaded_audio_data.value = false
    runAudioPath()
  }
})

// Methods
const loadSong = (event: Event) => {
  if (!audio.value) return
  
  durationContainer_textContent.value = calculateTime(audio.value.duration)
  if (seekSlider.value) {
    seekSlider.value.max = audio.value.duration.toString()
  }
  
  if (svg.value) {
    svg.value.unpauseAnimations()
  }
  
  animationsvg_dur.value = audio.value.duration + "s"
  if (!animation.value) {
    animationsvgx_dur.value = audio.value.duration + "s"
  }
  
  if (svg.value) {
    svg.value.pauseAnimations()
    svg.value.setCurrentTime(0)
  }
  
  emit('on_loadedmetadata', event)
}

const playPause = () => {
  if (!audio.value) return
  
  if (!props.load_audio_onmount && !loaded_audio_data.value) {
    if (props.src) {
      return runAudioPath()
    }
    return
  }
  
  if (audio.value.paused) {
    audio.value.play()
    if (svg.value) {
      svg.value.unpauseAnimations()
    }
    if (path2.value) {
      path2.value.style.display = "block"
    }
    audio_paused.value = false
    raf.value = requestAnimationFrame(whilePlaying)
  } else {
    audio.value.pause()
    if (svg.value) {
      svg.value.pauseAnimations()
    }
    audio_paused.value = true
    if (raf.value) {
      cancelAnimationFrame(raf.value)
    }
  }
}

const sliderInput = () => {
  path2_display.value = "block"
  if (seekSlider.value) {
    currentTimeContainer_textContent.value = calculateTime(parseFloat(seekSlider.value.value))
    if (svg.value) {
      svg.value.setCurrentTime(parseFloat(seekSlider.value.value))
    }
    if (!audio.value?.paused && raf.value) {
      cancelAnimationFrame(raf.value)
    }
  }
}

const sliderChange = () => {
  if (!audio.value || !seekSlider.value) return
  
  if (props.disable_seeking) {
    whilePlaying()
    return emit('tried_to_seek', false)
  }
  
  emit('tried_to_seek', true)
  audio.value.currentTime = parseFloat(seekSlider.value.value)
  path2_display.value = "block"
  
  if (svg.value) {
    svg.value.setCurrentTime(parseFloat(seekSlider.value.value))
  }
  
  if (!audio.value.paused) {
    raf.value = requestAnimationFrame(whilePlaying)
  }
}

const onFinish = (event: Event) => {
  if (!seekSlider.value || !audio.value) return
  
  seekSlider.value.value = audio.value.duration.toString()
  if (svg.value) {
    svg.value.setCurrentTime(audio.value.duration)
    svg.value.pauseAnimations()
  }
  
  audio_paused.value = true
  if (raf.value) {
    cancelAnimationFrame(raf.value)
  }
  
  emit('on_ended', event)
}

const whilePlaying = () => {
  if (!audio.value || !seekSlider.value) return
  
  seekSlider.value.value = audio.value.currentTime.toString()
  currentTimeContainer_textContent.value = calculateTime(parseFloat(seekSlider.value.value))
  
  if (svg.value) {
    svg.value.setCurrentTime(parseFloat(seekSlider.value.value))
  }
  
  raf.value = requestAnimationFrame(whilePlaying)
}

const runAudioPath = async () => {
  if (!props.src) return
  await getAudioData(props.src)
}

const svgDraw = () => {
  if (!audioData.value) return
  
  const path = linearPath(audioData.value, player_options.value)
  
  if (!animation.value) {
    path1_d.value = path
    path2_d.value = path
  } else {
    if (animationsvg.value) {
      animationsvg.value.setAttribute('values', path)
    }
  }
  
  if (svg.value && seekSlider.value) {
    svg.value.setCurrentTime(parseFloat(seekSlider.value.value))
  }
}

const calculateTime = (secs: number): string => {
  const minutes = Math.floor(secs / 60)
  const seconds = Math.floor(secs % 60)
  const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`
  return `${minutes}:${returnedSeconds}`
}

const getAudioData = async (url: string): Promise<void> => {
  loading_audio_data.value = true
  
  try {
    const res = await fetch(url)
    
    if (!res.headers.get('Content-Type')?.includes('audio/')) {
      emit('on_error', { message: 'Invalid audio type', type: 'not_audio' })
      loading_audio_data.value = false
      return
    }
    
    const blob = await res.blob()
    const src = URL.createObjectURL(blob)
    
    if (audio.value) {
      audio.value.src = src
    }
    
    const arrayBuffer = await blob.arrayBuffer()
    
    if (!audioContext.value) return
    
    audioContext.value.decodeAudioData(
      arrayBuffer,
      (bufferData) => {
        audioData.value = bufferData
        setTimeout(() => {
          loading_audio_data.value = false
          loaded_audio_data.value = true
          loadSong(new Event('loadedmetadata'))
          svgDraw()
        }, 1000)
      },
      (err) => {
        loading_audio_data.value = false
        emit('on_error', err)
      }
    )
  } catch (err) {
    loading_audio_data.value = false
    emit('on_error', err)
  }
}

// Wave functions (TypeScript versions)
const linearPath = (audioBuffer: AudioBuffer, options: PlayerOptions): string => {
  let {
    channel = 0,
    samples = audioBuffer.length,
    height = 100,
    width = 800,
    top = 0,
    left = 0,
    type = 'steps',
    paths = [{ d: 'Q', sx: 0, sy: 0, x: 50, y: 100, ex: 100, ey: 0 }],
    animation = false,
    animationframes = 10,
    normalize = true,
  } = options
  if(!height) height = 100
  if(!width) width = 800

  const framesData = getFramesData(audioBuffer, channel, animation, animationframes)
  const filteredData = getFilterData(framesData, samples)
  const normalizeData = normalize ? getNormalizeData(filteredData) : filteredData

  let path = ''

  const fixHeight = type != 'bars' ? (height + top * 2) / 2 : height + top
  const fixWidth = width / samples
  const pathslength = paths.length
  const fixpathslength = type == 'mirror' ? pathslength * 2 : pathslength

  const normalizeDataLength = normalizeData.length

  for (let f = 0; f < normalizeDataLength; f++) {
    if (f > 0) {
      const pathlength = path.length
      const lastvalue = path.charAt(pathlength - 1)
      if (lastvalue == ';' || pathlength === 0) {
        path += ' M 0 0 ;'
      } else {
        path += ';'
      }
    }

    let last_pos_x = -9999
    let last_pos_y = -9999

    for (let i = 0; i < samples; i++) {
      const positive = type != 'bars' ? (i % 2 ? 1 : -1) : 1
      let mirror = 1
      for (let j = 0; j < fixpathslength; j++) {
        let k = j
        if (j >= pathslength) {
          k = j - pathslength
          mirror = -1
        }
        paths[k].minshow = paths[k].minshow ?? 0
        paths[k].maxshow = paths[k].maxshow ?? 1
        paths[k].normalize = paths[k].normalize ?? false
        const normalizeDataValue = paths[k].normalize ? 1 : normalizeData[f][i]
        if (
          paths[k].minshow! <= normalizeData[f][i] &&
          paths[k].maxshow! >= normalizeData[f][i]
        ) {
          switch (paths[k].d) {
            case 'L': {
              const pos_x = i * fixWidth + (fixWidth * (paths[k].sx || 0)) / 100 + left
              const pos_y =
                fixHeight +
                (normalizeDataValue * (paths[k].sy || 0) / 100) *
                  (type != 'bars' ? height / 2 : height) *
                  -positive *
                  mirror

              const end_pos_x =
                i * fixWidth + (fixWidth * (paths[k].ex || 0)) / 100 + left
              const end_pos_y =
                fixHeight +
                (normalizeDataValue * (paths[k].ey || 0) / 100) *
                  (type != 'bars' ? height / 2 : height) *
                  -positive *
                  mirror

              if (pos_x !== last_pos_x || pos_y !== last_pos_y) {
                path += `M ${pos_x} ${pos_y} `
              }

              path += `L ${end_pos_x} ${end_pos_y} `

              last_pos_x = end_pos_x
              last_pos_y = end_pos_y
              break
            }

            case 'H': {
              const pos_x = i * fixWidth + (fixWidth * (paths[k].sx || 0)) / 100 + left
              const pos_y =
                fixHeight +
                (normalizeDataValue * (paths[k].y || 0) / 100) *
                  (type != 'bars' ? height / 2 : height) *
                  -positive *
                  mirror

              const end_pos_x =
                i * fixWidth + (fixWidth * (paths[k].ex || 0)) / 100 + left
              const end_pos_y = pos_y

              if (pos_x !== last_pos_x || pos_y !== last_pos_y) {
                path += `M ${pos_x} ${pos_y} `
              }

              path += `H ${end_pos_x} `

              last_pos_x = end_pos_x
              last_pos_y = end_pos_y
              break
            }

            case 'V': {
              const pos_x = i * fixWidth + (fixWidth * (paths[k].x || 0)) / 100 + left
              const pos_y =
                fixHeight +
                (normalizeDataValue * (paths[k].sy || 0) / 100) *
                  (type != 'bars' ? height / 2 : height) *
                  -positive *
                  mirror

              const end_pos_x = pos_x
              const end_pos_y =
                fixHeight +
                (normalizeDataValue * (paths[k].ey || 0) / 100) *
                  (type != 'bars' ? height / 2 : height) *
                  -positive *
                  mirror

              if (pos_x !== last_pos_x || pos_y !== last_pos_y) {
                path += `M ${pos_x} ${pos_y} `
              }

              path += `V ${end_pos_y} `

              last_pos_x = end_pos_x
              last_pos_y = end_pos_y
              break
            }

            case 'C': {
              const pos_x = i * fixWidth + (fixWidth * (paths[k].sx || 0)) / 100 + left
              const pos_y = fixHeight - (fixHeight * (paths[k].sy || 0)) / 100 * positive

              const center_pos_x =
                i * fixWidth + (fixWidth * (paths[k].x || 0)) / 100 + left
              const center_pos_y =
                fixHeight +
                (normalizeDataValue * (paths[k].y || 0) / 100) *
                  (type != 'bars' ? height : height * 2) *
                  -positive *
                  mirror

              const end_pos_x =
                i * fixWidth + (fixWidth * (paths[k].ex || 0)) / 100 + left
              const end_pos_y = fixHeight - (fixHeight * (paths[k].ey || 0)) / 100 * positive

              if (pos_x !== last_pos_x || pos_y !== last_pos_y) {
                path += `M ${pos_x} ${pos_y} `
              }

              path += `C ${pos_x} ${pos_y} ${center_pos_x} ${center_pos_y} ${end_pos_x} ${end_pos_y} `

              last_pos_x = end_pos_x
              last_pos_y = end_pos_y
              break
            }

            case 'Q': {
              const pos_x = i * fixWidth + (fixWidth * (paths[k].sx || 0)) / 100 + left
              const pos_y =
                fixHeight +
                (normalizeDataValue * (paths[k].sy || 0) / 100) *
                  (type != 'bars' ? height / 2 : height) *
                  -positive *
                  mirror

              const center_pos_x =
                i * fixWidth + (fixWidth * (paths[k].x || 0)) / 100 + left
              const center_pos_y =
                fixHeight +
                (normalizeDataValue * (paths[k].y || 0) / 100) *
                  (type != 'bars' ? height : height * 2) *
                  -positive *
                  mirror

              const end_pos_x =
                i * fixWidth + (fixWidth * (paths[k].ex || 0)) / 100 + left
              const end_pos_y =
                fixHeight +
                (normalizeDataValue * (paths[k].ey || 0) / 100) *
                  (type != 'bars' ? height / 2 : height) *
                  -positive *
                  mirror

              if (pos_x !== last_pos_x || pos_y !== last_pos_y) {
                path += `M ${pos_x} ${pos_y} `
              }

              path += `Q ${center_pos_x} ${center_pos_y} ${end_pos_x} ${end_pos_y} `

              last_pos_x = end_pos_x
              last_pos_y = end_pos_y
              break
            }

            case 'A': {
              const pos_x = i * fixWidth + (fixWidth * (paths[k].sx || 0)) / 100 + left
              const pos_y =
                fixHeight +
                (normalizeDataValue * (paths[k].sy || 0) / 100) *
                  (type != 'bars' ? height / 2 : height) *
                  -positive *
                  mirror

              const end_pos_x =
                i * fixWidth + (fixWidth * (paths[k].ex || 0)) / 100 + left
              const end_pos_y =
                fixHeight +
                (normalizeDataValue * (paths[k].ey || 0) / 100) *
                  (type != 'bars' ? height / 2 : height) *
                  -positive *
                  mirror

              if (pos_x !== last_pos_x || pos_y !== last_pos_y) {
                path += `M ${pos_x} ${pos_y} `
              }
              const rx = (paths[k].rx || 0) * fixWidth / 100
              const ry = (paths[k].ry || 0) * fixWidth / 100
              let sweep = paths[k].sweep || 0
              if (positive == -1) {
                if (sweep == 1) {
                  sweep = 0
                } else {
                  sweep = 1
                }
              }
              if (mirror == -1) {
                if (sweep == 1) {
                  sweep = 0
                } else {
                  sweep = 1
                }
              }
              path += `A ${rx} ${ry} ${paths[k].angle || 0} ${paths[k].arc || 0} ${sweep} ${end_pos_x} ${end_pos_y} `

              last_pos_x = end_pos_x
              last_pos_y = end_pos_y
              break
            }

            case 'Z':
              path += 'Z '
              break

            default:
              break
          }
        }
      }
    }
  }
  return path
}

const polarPath = (audioBuffer: AudioBuffer, options: PlayerOptions): string => {
  const {
    channel = 0,
    samples = audioBuffer.length,
    top = 0,
    left = 0,
    distance = 50,
    type = 'steps',
    length = 100,
    startdeg = 0,
    enddeg = 360,
    invertdeg = false,
    invertpath = false,
    paths = [{
         d: 'Q', sdeg: 0, sr: 0, deg: 50, r: 100, edeg: 100, er: 0 ,
         minshow: 0,
         maxshow: 1,
         normalize: false,
         arc: 0, angle: 0, sweep: 0,
         rx: 0, ry: 0
    }],
    animation = false,
    animationframes = 10,
    normalize = true,
  } = options

  const framesData = getFramesData(audioBuffer, channel, animation, animationframes)
  const filteredData = getFilterData(framesData, samples)
  const normalizeData = normalize ? getNormalizeData(filteredData) : filteredData

  let path = ''
  const fixenddeg = enddeg < startdeg ? enddeg + 360 : enddeg
  const deg = !invertdeg ? (fixenddeg - startdeg) / samples : (startdeg - fixenddeg) / samples
  const fixOrientation = !invertdeg ? 90 + startdeg : 90 + startdeg + 180
  const invert = !invertpath ? 1 : -1
  const pathslength = paths.length
  const fixpathslength = type == 'mirror' ? pathslength * 2 : pathslength
  const pi180 = Math.PI / 180

  const normalizeDataLength = normalizeData.length

  for (let f = 0; f < normalizeDataLength; f++) {
    if (f > 0) {
      const pathlength = path.length
      const lastvalue = path.charAt(pathlength - 1)
      if (lastvalue == ';' || pathlength === 0) {
        path += ' M 0 0 ;'
      } else {
        path += ';'
      }
    }

    let last_pos_x = -9999
    let last_pos_y = -9999

    for (let i = 0; i < samples; i++) {
      const positive = type != 'bars' ? (i % 2 ? 1 : -1) : 1
      let mirror = 1
      for (let j = 0; j < fixpathslength; j++) {
        let k = j
        if (j >= pathslength) {
          k = j - pathslength
          mirror = -1
        }
        paths[k].minshow = paths[k].minshow ?? 0
        paths[k].maxshow = paths[k].maxshow ?? 1
        paths[k].normalize = paths[k].normalize ?? false
        const normalizeDataValue = paths[k].normalize ? 1 : normalizeData[f][i]
        if (
          paths[k].minshow! <= normalizeData[f][i] &&
          paths[k].maxshow! >= normalizeData[f][i]
        ) {
          switch (paths[k].d) {
            case 'L': {
              const angleStart = (deg * (i + (paths[k].sdeg || 0) / 100) - fixOrientation) * pi180
              const angleEnd = (deg * (i + (paths[k].edeg || 0) / 100) - fixOrientation) * pi180

              const pos_x =
                left +
                ((length * (paths[k].sr || 0) / 100) * normalizeDataValue * positive * mirror * invert + distance) *
                  Math.cos(angleStart)
              const pos_y =
                top +
                ((length * (paths[k].sr || 0) / 100) * normalizeDataValue * positive * mirror * invert + distance) *
                  Math.sin(angleStart)

              const end_pos_x =
                left +
                ((length * (paths[k].er || 0) / 100) * normalizeDataValue * positive * mirror * invert + distance) *
                  Math.cos(angleEnd)
              const end_pos_y =
                top +
                ((length * (paths[k].er || 0) / 100) * normalizeDataValue * positive * mirror * invert + distance) *
                  Math.sin(angleEnd)

              if (pos_x !== last_pos_x || pos_y !== last_pos_y) {
                path += `M ${pos_x} ${pos_y} `
              }

              path += `L ${end_pos_x} ${end_pos_y} `

              last_pos_x = end_pos_x
              last_pos_y = end_pos_y
              break
            }

            case 'C': {
              const angleStart = (deg * (i + (paths[k].sdeg || 0) / 100) - fixOrientation) * pi180
              const angle = (deg * (i + (paths[k].deg || 0) / 100) - fixOrientation) * pi180
              const angleEnd = (deg * (i + (paths[k].edeg || 0) / 100) - fixOrientation) * pi180

              const pos_x =
                left +
                ((length * (paths[k].sr || 0) / 100) * normalizeDataValue * positive * mirror * invert + distance) *
                  Math.cos(angleStart)
              const pos_y =
                top +
                ((length * (paths[k].sr || 0) / 100) * normalizeDataValue * positive * mirror * invert + distance) *
                  Math.sin(angleStart)

              const center_pos_x =
                left +
                ((length * (paths[k].r || 0) / 100) * normalizeDataValue * positive * mirror * invert + distance) *
                  Math.cos(angle)
              const center_pos_y =
                top +
                ((length * (paths[k].r || 0) / 100) * normalizeDataValue * positive * mirror * invert + distance) *
                  Math.sin(angle)

              const end_pos_x =
                left +
                ((length * (paths[k].er || 0) / 100) * normalizeDataValue * positive * mirror * invert + distance) *
                  Math.cos(angleEnd)
              const end_pos_y =
                top +
                ((length * (paths[k].er || 0) / 100) * normalizeDataValue * positive * mirror * invert + distance) *
                  Math.sin(angleEnd)

              if (pos_x !== last_pos_x || pos_y !== last_pos_y) {
                path += `M ${pos_x} ${pos_y} `
              }

              path += `C ${pos_x} ${pos_y} ${center_pos_x} ${center_pos_y} ${end_pos_x} ${end_pos_y} `

              last_pos_x = end_pos_x
              last_pos_y = end_pos_y
              break
            }

            case 'Q': {
              const angleStart = (deg * (i + (paths[k].sdeg || 0) / 100) - fixOrientation) * pi180
              const angle = (deg * (i + (paths[k].deg || 0) / 100) - fixOrientation) * pi180
              const angleEnd = (deg * (i + (paths[k].edeg || 0) / 100) - fixOrientation) * pi180

              const pos_x =
                left +
                ((length * (paths[k].sr || 0) / 100) * normalizeDataValue * positive * mirror * invert + distance) *
                  Math.cos(angleStart)
              const pos_y =
                top +
                ((length * (paths[k].sr || 0) / 100) * normalizeDataValue * positive * mirror * invert + distance) *
                  Math.sin(angleStart)

              const center_pos_x =
                left +
                ((length * (paths[k].r || 0) / 100) * normalizeDataValue * positive * mirror * invert + distance) *
                  Math.cos(angle)
              const center_pos_y =
                top +
                ((length * (paths[k].r || 0) / 100) * normalizeDataValue * positive * mirror * invert + distance) *
                  Math.sin(angle)

              const end_pos_x =
                left +
                ((length * (paths[k].er || 0) / 100) * normalizeDataValue * positive * mirror * invert + distance) *
                  Math.cos(angleEnd)
              const end_pos_y =
                top +
                ((length * (paths[k].er || 0) / 100) * normalizeDataValue * positive * mirror * invert + distance) *
                  Math.sin(angleEnd)

              if (pos_x !== last_pos_x || pos_y !== last_pos_y) {
                path += `M ${pos_x} ${pos_y} `
              }

              path += `Q ${center_pos_x} ${center_pos_y} ${end_pos_x} ${end_pos_y} `

              last_pos_x = end_pos_x
              last_pos_y = end_pos_y
              break
            }

            case 'A': {
              const angleStart = (deg * (i + (paths[k].sdeg || 0) / 100) - fixOrientation) * pi180
              const angleEnd = (deg * (i + (paths[k].edeg || 0) / 100) - fixOrientation) * pi180

              const pos_x =
                left +
                ((length * (paths[k].sr || 0) / 100) * normalizeDataValue * positive * mirror * invert + distance) *
                  Math.cos(angleStart)
              const pos_y =
                top +
                ((length * (paths[k].sr || 0) / 100) * normalizeDataValue * positive * mirror * invert + distance) *
                  Math.sin(angleStart)

              const end_pos_x =
                left +
                ((length * (paths[k].er || 0) / 100) * normalizeDataValue * positive * mirror * invert + distance) *
                  Math.cos(angleEnd)
              const end_pos_y =
                top +
                ((length * (paths[k].er || 0) / 100) * normalizeDataValue * positive * mirror * invert + distance) *
                  Math.sin(angleEnd)

              if (pos_x !== last_pos_x || pos_y !== last_pos_y) {
                path += `M ${pos_x} ${pos_y} `
              }

              const angle = (deg * i * (paths[k].angle || 0)) / 100
              const rx = (paths[k].rx || 0) * deg / 100
              const ry = (paths[k].ry || 0) * deg / 100

              let sweep = paths[k].sweep || 0
              if (positive == -1) {
                if (sweep == 1) {
                  sweep = 0
                } else {
                  sweep = 1
                }
              }
              if (mirror == -1) {
                if (sweep == 1) {
                  sweep = 0
                } else {
                  sweep = 1
                }
              }
              path += `A ${rx} ${ry} ${angle} ${paths[k].arc || 0} ${sweep} ${end_pos_x} ${end_pos_y} `

              last_pos_x = end_pos_x
              last_pos_y = end_pos_y
              break
            }

            case 'Z':
              path += 'Z '
              break

            default:
              break
          }
        }
      }
    }
  }
  return path
}

const getFramesData = (
  audioBuffer: AudioBuffer,
  channel: number,
  animation: boolean,
  animationframes: number
): Float32Array[] => {
  const rawData = audioBuffer.getChannelData(channel)
  const framesData: Float32Array[] = []

  if (animation) {
    const frames = audioBuffer.sampleRate / animationframes
    for (let index = 0; index < rawData.length; index += frames) {
      const partraw = rawData.slice(index, index + frames)
      framesData.push(partraw)
    }
  } else {
    framesData.push(rawData)
  }

  return framesData
}

const getFilterData = (framesData: Float32Array[], samples: number): number[][] => {
  const filteredData: number[][] = []
  const framesDataLength = framesData.length

  for (let f = 0; f < framesDataLength; f++) {
    const blockSize = Math.floor(framesData[f].length / samples)
    const filteredDataBlock: number[] = []

    for (let i = 0; i < samples; i++) {
      const blockStart = blockSize * i
      let sum = 0

      for (let j = 0; j < blockSize; j++) {
        sum = sum + Math.abs(framesData[f][blockStart + j])
      }

      filteredDataBlock.push(sum / blockSize)
    }

    filteredData.push(filteredDataBlock)
  }

  return filteredData
}

const getNormalizeData = (filteredData: number[][]): number[][] => {
  const multipliers: number[] = []
  const filteredDataLength = filteredData.length

  for (let i = 0; i < filteredDataLength; i++) {
    const multiplier = Math.max(...filteredData[i])
    multipliers.push(multiplier)
  }

  const maxMultiplier = Math.pow(Math.max(...multipliers), -1)
  const normalizeData: number[][] = []

  for (let i = 0; i < filteredDataLength; i++) {
    const normalizeDataBlock = filteredData[i].map((n) => n * maxMultiplier)
    normalizeData.push(normalizeDataBlock)
  }

  return normalizeData
}
</script>

<style scoped>
*,
:after,
:before {
  box-sizing: border-box;
  margin: 0;
}
:host {
  display: flex;
}
.player {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
#play {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0 0 0 10px;
  margin: 0px;
}
#play svg {
  fill: #858a8d;
  position: relative;
  transition: transform 0.3s;
  top: -0.5px;
}
#play svg:hover {
  transform: scale(1.2);
}
#play svg path {
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: 0.2s;
}
#svg {
  margin: 0 10px;
  overflow: visible;
  stroke-width: 1px;
  fill: none;
}
#path1 {
  stroke: #dadcdd;
  overflow: visible;
  stroke-linecap: round;
}
#path2 {
  stroke: #858a8d;
  overflow: visible;
  stroke-linecap: round;
}
#slider {
  position: relative;
}
#duration,
#current-time {
  position: relative;
  top: -1.1px;
  color: #858a8d;
  margin: 0px 10px;
  font-size: 16px;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  min-width: 32px;
}
#seek-slider {
  position: absolute;
  width: 100%;
  left: 0;
}
input[type='range'] {
  -webkit-appearance: none;
  width: 100%;
  background: transparent;
  padding: 0px;
  margin: 0px;
  border: 0px;
}
input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
}
input[type='range']:focus {
  outline: none;
}
input[type='range']::-ms-track {
  width: 100%;
  cursor: pointer;
  background: transparent;
  border-color: transparent;
  color: transparent;
}
input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  position: relative;
  height: 12.5px;
  width: 12.5px;
  border-radius: 50%;
  background: #4fc3f7;
  cursor: pointer;
  box-shadow: none;
}
input[type='range']::-webkit-slider-thumb {
  transition: transform 0.3s;
}
input[type='range']:active::-webkit-slider-thumb {
  transform: scale(1.5);
}
input[type='range']::-moz-range-thumb {
  height: 12.5px;
  width: 12.5px;
  border-radius: 50%;
  background: #4fc3f7;
  cursor: pointer;
  box-shadow: none;
  border: 0px;
}
input[type='range']:active::-moz-range-thumb {
  transform: scale(1.5);
}
span {
  color: red;
}
</style>
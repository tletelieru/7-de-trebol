const BEAT_SECONDS = 60 / 96
const STEP_SECONDS = BEAT_SECONDS / 2
const LOOKAHEAD_SECONDS = 0.3
const TICK_MS = 100
const MASTER_VOLUME = 0.5

const REST = 0

const MELODY = [
  69, REST, 72, REST, 76, 74, 72, REST, 71, REST, 69, REST, 67, REST, REST, REST,
  65, REST, 69, REST, 72, 71, 69, REST, 67, REST, 65, REST, 64, REST, REST, REST,
  60, REST, 64, REST, 67, 69, 67, REST, 64, REST, 67, REST, 72, REST, REST, REST,
  71, REST, 67, REST, 74, 72, 71, REST, 69, REST, 71, REST, 69, REST, REST, REST,
]

const CHORDS = [
  [45, 57, 60, 64],
  [41, 53, 57, 60],
  [36, 55, 60, 64],
  [43, 55, 59, 62],
]

const STEPS_PER_CHORD = 16

function frequency(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12)
}

function playTone(
  context: AudioContext,
  output: AudioNode,
  midi: number,
  time: number,
  length: number,
  type: OscillatorType,
  volume: number,
): void {
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = type
  oscillator.frequency.value = frequency(midi)
  gain.gain.setValueAtTime(volume, time)
  gain.gain.exponentialRampToValueAtTime(0.001, time + length)
  oscillator.connect(gain).connect(output)
  oscillator.start(time)
  oscillator.stop(time + length)
}

function scheduleStep(context: AudioContext, output: AudioNode, step: number, time: number): void {
  const note = MELODY[step % MELODY.length]
  if (note !== REST) playTone(context, output, note, time, STEP_SECONDS * 1.8, 'square', 0.035)
  const position = step % (STEPS_PER_CHORD * CHORDS.length)
  const chord = CHORDS[Math.floor(position / STEPS_PER_CHORD)]
  const inChord = position % STEPS_PER_CHORD
  if (inChord % 8 === 0) playTone(context, output, chord[0], time, BEAT_SECONDS * 1.8, 'triangle', 0.14)
  if (inChord % 2 === 1) {
    playTone(context, output, chord[1 + (inChord >> 1) % 3], time, STEP_SECONDS, 'triangle', 0.05)
  }
}

export interface Music {
  play: () => void
  pause: () => void
}

export function createMusic(): Music | null {
  if (typeof AudioContext === 'undefined') return null
  let context: AudioContext | null = null
  let output: GainNode | null = null
  let timer: ReturnType<typeof setInterval> | null = null
  let step = 0
  let nextTime = 0

  const tick = () => {
    if (!context || !output) return
    while (nextTime < context.currentTime + LOOKAHEAD_SECONDS) {
      scheduleStep(context, output, step, nextTime)
      step += 1
      nextTime += STEP_SECONDS
    }
  }

  return {
    play() {
      if (!context) {
        context = new AudioContext()
        output = context.createGain()
        output.gain.value = MASTER_VOLUME
        output.connect(context.destination)
        nextTime = context.currentTime + 0.05
      }
      void context.resume()
      timer ??= setInterval(tick, TICK_MS)
    },
    pause() {
      if (timer !== null) clearInterval(timer)
      timer = null
      void context?.suspend()
    },
  }
}

import { nextRandom } from '@trebol/engine'
import { mediumBot } from './medium'
import type { Bot, Rng } from './types'

const CAREFUL_RATE = 0.65

export function createRng(seed: number): Rng {
  let state = seed
  return () => {
    const random = nextRandom(state)
    state = random.rng
    return random.value
  }
}

export const randomBot: Bot = {
  choose: (_view, legal, rng) => legal[Math.floor(rng() * legal.length)],
}

export const easyBot: Bot = {
  choose: (view, legal, rng) =>
    rng() < CAREFUL_RATE ? mediumBot.choose(view, legal, rng) : randomBot.choose(view, legal, rng),
}

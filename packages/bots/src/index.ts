import { mediumBot } from './medium'
import { createHardBot, hardBot } from './hard'
import type { Bot, Level } from './types'

export { createRng, easyBot, randomBot } from './easy'
export { createHardBot, hardBot } from './hard'
export { mediumBot } from './medium'
export type { Bot, Level, Rng } from './types'

const PLAYER_SEAT = 0

export const BOTS: Record<Level, Bot> = {
  easy: mediumBot,
  medium: hardBot,
  hard: createHardBot({ target: PLAYER_SEAT }),
}

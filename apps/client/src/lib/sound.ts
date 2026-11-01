import { createContext } from 'react'
import { RULES } from '@trebol/engine'
import type { GameId } from '@trebol/engine'
import type { Music, TrackId } from './music'

export const SoundContext = createContext<Music | null>(null)

export function trackForGame(game: GameId): TrackId {
  if (game === 'domino') return 'domino'
  return RULES[game].sign === 1 ? 'positive' : 'negative'
}

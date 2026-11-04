import { createContext } from 'react'
import type { Action, GameId, MatchState } from '@trebol/engine'
import type { Music, TrackId } from './music'

export const SoundContext = createContext<Music | null>(null)

export const MusicContext = createContext<Music | null>(null)

export const GAME_TRACKS: Record<GameId, TrackId> = {
  trebol: 'negative',
  corazones: 'positive',
  quinas: 'negative',
  todo: 'positive',
  nada: 'negative',
  domino: 'domino',
}

export const ACTION_SOUNDS: Record<Action['type'], 'knock' | null> = {
  play: null,
  pass: 'knock',
}

export function trackForMatch(state: MatchState | null): TrackId {
  return state ? GAME_TRACKS[state.game.id] : 'intro'
}

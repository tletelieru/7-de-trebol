import type { PlayerCount, Seat } from '@trebol/engine'
import { readReduceMotion } from './settings'

export const DRAW_MS = 2000
export const RESULT_MS = 800
const LAPS = 2

export interface Hop {
  seat: Seat
  at: number
}

export function drawHops(players: PlayerCount, dealer: Seat): Hop[] {
  const count = players * LAPS + dealer + 1
  return Array.from({ length: count }, (_, index) => ({
    seat: index % players,
    at: Math.round(DRAW_MS * (1 - Math.sqrt(1 - index / (count - 1)))),
  }))
}

export function prefersLessMotion(): boolean {
  const media = window.matchMedia?.('(prefers-reduced-motion: reduce)')
  return readReduceMotion() || media?.matches === true
}

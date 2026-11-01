import { createContext, useContext } from 'react'
import { RULES, cardPoints } from '@trebol/engine'
import type { Card, GameId } from '@trebol/engine'

export type KeyCardTone = 'bonus' | 'danger'

export const KeyCardContext = createContext<GameId | null>(null)

export function keyCardTone(card: Card, game: GameId): KeyCardTone | null {
  if (game === 'domino') return null
  const rule = RULES[game]
  if (cardPoints(card, rule) === 0) return null
  return rule.sign === 1 ? 'bonus' : 'danger'
}

export function useKeyCardTone(card: Card): KeyCardTone | null {
  const game = useContext(KeyCardContext)
  return game ? keyCardTone(card, game) : null
}

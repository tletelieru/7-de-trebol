import type { Card, PlayerCount, Rank, Suit } from '@trebol/engine'

export type SeatPosition = 'bottom' | 'right' | 'top' | 'left'

export const SUIT_SYMBOL: Record<Suit, string> = {
  clubs: '♣',
  diamonds: '♦',
  hearts: '♥',
  spades: '♠',
}

const FACE: Partial<Record<Rank, string>> = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' }

const HAND_SUITS: Suit[] = ['clubs', 'hearts', 'spades', 'diamonds']

const POSITIONS: Record<PlayerCount, SeatPosition[]> = {
  3: ['bottom', 'right', 'left'],
  4: ['bottom', 'right', 'top', 'left'],
}

export const SEAT_VECTOR: Record<SeatPosition, { x: number; y: number }> = {
  bottom: { x: 0, y: 260 },
  right: { x: 150, y: 0 },
  top: { x: 0, y: -200 },
  left: { x: -150, y: 0 },
}

export function cardKey(card: Card): string {
  return `${card.suit}-${card.rank}`
}

export function moveItem<T>(items: T[], from: number, to: number): T[] {
  const result = [...items]
  const [item] = result.splice(from, 1)
  result.splice(to, 0, item)
  return result
}

export function formatPoints(value: number): string {
  if (value > 0) return `+${value}`
  if (value < 0) return `−${Math.abs(value)}`
  return '0'
}

export function rankLabel(rank: Rank): string {
  return FACE[rank] ?? String(rank)
}

export const SUIT_ON_CARD: Record<Suit, string> = {
  clubs: 'text-card-clubs',
  diamonds: 'text-card-diamonds',
  hearts: 'text-card-hearts',
  spades: 'text-card-spades',
}

export const SUIT_ON_TABLE: Record<Suit, string> = {
  clubs: 'text-table-clubs',
  diamonds: 'text-table-diamonds',
  hearts: 'text-table-hearts',
  spades: 'text-table-spades',
}

export function seatPosition(seat: number, players: PlayerCount): SeatPosition {
  return POSITIONS[players][seat]
}

export function sortHand(hand: Card[], aceLow: boolean, descending = false): Card[] {
  const value = (card: Card) => (aceLow && card.rank === 14 ? 1 : card.rank)
  const direction = descending ? -1 : 1
  return [...hand].sort(
    (a, b) =>
      HAND_SUITS.indexOf(a.suit) - HAND_SUITS.indexOf(b.suit) ||
      direction * (value(a) - value(b)),
  )
}

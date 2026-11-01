import { ACE, RANKS, SEVEN, SUITS, sameCard } from './cards'
import type { Card, PlayerCount, Rank, Suit } from './cards'

export interface SuitRow {
  low: Rank
  high: Rank
}

export type Board = Record<Suit, SuitRow | null>

export function emptyBoard(): Board {
  return { clubs: null, diamonds: null, hearts: null, spades: null }
}

export function dominoRow(suit: Suit, players: PlayerCount): Rank[] {
  const row: Rank[] = [ACE, ...RANKS.filter((rank) => rank !== ACE)]
  if (players === 3 && suit === 'diamonds') return row.filter((rank) => rank !== 2)
  return row
}

export function playableOnBoard(board: Board, players: PlayerCount): Card[] {
  return SUITS.flatMap((suit) => {
    const placed = board[suit]
    if (!placed) return [{ suit, rank: SEVEN }]
    const row = dominoRow(suit, players)
    const below = row[row.indexOf(placed.low) - 1]
    const above = row[row.indexOf(placed.high) + 1]
    return [below, above].flatMap((rank) => (rank === undefined ? [] : [{ suit, rank }]))
  })
}

export function placeOnBoard(board: Board, card: Card, players: PlayerCount): Board {
  const placed = board[card.suit]
  if (!placed) return { ...board, [card.suit]: { low: card.rank, high: card.rank } }
  const row = dominoRow(card.suit, players)
  const position = row.indexOf(card.rank)
  const low = position < row.indexOf(placed.low) ? card.rank : placed.low
  const high = position > row.indexOf(placed.high) ? card.rank : placed.high
  return { ...board, [card.suit]: { low, high } }
}

export function dominoPlays(hand: Card[], board: Board, players: PlayerCount): Card[] {
  const playable = playableOnBoard(board, players)
  return hand.filter((card) => playable.some((option) => sameCard(option, card)))
}

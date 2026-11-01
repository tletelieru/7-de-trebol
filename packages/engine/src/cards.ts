export type Suit = 'clubs' | 'diamonds' | 'hearts' | 'spades'

export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14

export type PlayerCount = 3 | 4

export type Seat = number

export type GameId = 'trebol' | 'corazones' | 'quinas' | 'todo' | 'nada' | 'domino'

export interface Card {
  suit: Suit
  rank: Rank
}

export const SUITS: Suit[] = ['clubs', 'diamonds', 'hearts', 'spades']

export const RANKS: Rank[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]

export const QUEEN: Rank = 12

export const SEVEN: Rank = 7

export const ACE: Rank = 14

export const GAME_ORDER: GameId[] = ['trebol', 'corazones', 'quinas', 'todo', 'nada', 'domino']

export function createDeck(players: PlayerCount): Card[] {
  const deck = SUITS.flatMap((suit) => RANKS.map((rank) => ({ suit, rank })))
  if (players === 4) return deck
  return deck.filter((card) => !(card.suit === 'diamonds' && card.rank === 2))
}

export function sameCard(a: Card, b: Card): boolean {
  return a.suit === b.suit && a.rank === b.rank
}

export function isSevenOfClubs(card: Card): boolean {
  return card.suit === 'clubs' && card.rank === SEVEN
}

export function isQueen(card: Card): boolean {
  return card.rank === QUEEN
}

export function isHeart(card: Card): boolean {
  return card.suit === 'hearts'
}

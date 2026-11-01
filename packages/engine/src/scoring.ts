import { isHeart, isQueen, isSevenOfClubs } from './cards'
import type { Card, GameId, Seat } from './cards'

export interface Rule {
  sign: 1 | -1
  tricks: number
  hearts: number
  queens: number
  seven: number
  last: number
}

export type TrickGameId = Exclude<GameId, 'domino'>

export interface Tally {
  tricks: number
  hearts: number
  queens: number
  seven: number
  last: number
}

export interface GameScore {
  game: GameId
  points: number[]
  tallies: Tally[]
  winner: Seat | null
  remaining: number[]
}

export const RULES: Record<TrickGameId, Rule> = {
  trebol: { sign: -1, tricks: 10, hearts: 0, queens: 0, seven: 150, last: 50 },
  corazones: { sign: 1, tricks: 10, hearts: 10, queens: 0, seven: 0, last: 50 },
  quinas: { sign: -1, tricks: 10, hearts: 0, queens: 50, seven: 0, last: 50 },
  todo: { sign: 1, tricks: 10, hearts: 10, queens: 50, seven: 150, last: 50 },
  nada: { sign: -1, tricks: 10, hearts: 10, queens: 50, seven: 150, last: 50 },
}

export const DOMINO_WIN = 300

export const DOMINO_CARD = 10

interface ScoredTrick {
  plays: { card: Card }[]
  winner: Seat
}

export function cardPoints(card: Card, rule: Rule): number {
  return (
    (isHeart(card) ? rule.hearts : 0) +
    (isQueen(card) ? rule.queens : 0) +
    (isSevenOfClubs(card) ? rule.seven : 0)
  )
}

export function tallyTricks(tricks: ScoredTrick[], players: number, complete: boolean): Tally[] {
  const tallies = Array.from({ length: players }, () => ({
    tricks: 0,
    hearts: 0,
    queens: 0,
    seven: 0,
    last: 0,
  }))
  tricks.forEach((trick, index) => {
    const tally = tallies[trick.winner]
    tally.tricks += 1
    if (complete && index === tricks.length - 1) tally.last = 1
    for (const { card } of trick.plays) {
      if (isHeart(card)) tally.hearts += 1
      if (isQueen(card)) tally.queens += 1
      if (isSevenOfClubs(card)) tally.seven = 1
    }
  })
  return tallies
}

export function tallyPoints(tally: Tally, rule: Rule): number {
  const points =
    tally.tricks * rule.tricks +
    tally.hearts * rule.hearts +
    tally.queens * rule.queens +
    tally.seven * rule.seven +
    tally.last * rule.last
  return rule.sign === 1 ? points : 0 - points
}

export function dominoPoints(remaining: number[], winner: Seat | null): number[] {
  if (winner === null) return remaining.map(() => 0)
  return remaining.map((cards, seat) => (seat === winner ? DOMINO_WIN : 0 - DOMINO_CARD * cards))
}

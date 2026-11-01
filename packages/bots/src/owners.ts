import { createDeck, emptyBoard, placeOnBoard, playableOnBoard, sameCard } from '@trebol/engine'
import type { Card, PlayerView, Seat } from '@trebol/engine'
import type { Rng } from './types'

export interface OwnerMatrix {
  hidden: Card[]
  owners: Seat[][]
  needs: number[]
}

function playedCards(view: PlayerView): Card[] {
  if (view.kind === 'domino') return view.moves.flatMap((move) => (move.card ? [move.card] : []))
  return [...view.tricks.flatMap((trick) => trick.plays), ...view.current].map((play) => play.card)
}

function isExcluded(view: PlayerView): (seat: Seat, card: Card) => boolean {
  if (view.kind === 'tricks') {
    const voids = new Set<string>()
    for (const plays of [...view.tricks.map((trick) => trick.plays), view.current]) {
      const lead = plays[0]?.card.suit
      for (const play of plays) {
        if (play.card.suit !== lead) voids.add(`${play.seat}-${lead}`)
      }
    }
    return (seat, card) => voids.has(`${seat}-${card.suit}`)
  }
  const excluded: Card[][] = Array.from({ length: view.players }, () => [])
  let board = emptyBoard()
  for (const move of view.moves) {
    if (move.card) board = placeOnBoard(board, move.card, view.players)
    else excluded[move.seat].push(...playableOnBoard(board, view.players))
  }
  return (seat, card) => excluded[seat].some((item) => sameCard(item, card))
}

function propagate(owners: Seat[][], needs: number[]): void {
  let changed = true
  while (changed) {
    changed = false
    needs.forEach((need, seat) => {
      const possible = owners.flatMap((list, index) => (list.includes(seat) ? [index] : []))
      const certain = possible.filter((index) => owners[index].length === 1)
      if (certain.length === need) {
        for (const index of possible) {
          if (owners[index].length > 1) {
            owners[index] = owners[index].filter((item) => item !== seat)
            changed = true
          }
        }
      }
      if (possible.length === need) {
        for (const index of possible) {
          if (owners[index].length > 1) {
            owners[index] = [seat]
            changed = true
          }
        }
      }
    })
  }
}

export function buildOwnerMatrix(view: PlayerView): OwnerMatrix {
  const seen = [...playedCards(view), ...view.hand]
  const hidden = createDeck(view.players).filter((card) => !seen.some((item) => sameCard(item, card)))
  const needs = view.handCounts.map((count, seat) => (seat === view.seat ? 0 : count))
  const excluded = isExcluded(view)
  const owners = hidden.map((card) =>
    needs.flatMap((need, seat) => (need > 0 && !excluded(seat, card) ? [seat] : [])),
  )
  propagate(owners, needs)
  return { hidden, owners, needs }
}

function shuffled(count: number, rng: Rng): number[] {
  const items = Array.from({ length: count }, (_, index) => index)
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[items[i], items[j]] = [items[j], items[i]]
  }
  return items
}

function tryDeal(matrix: OwnerMatrix, rng: Rng): Card[][] | null {
  const { hidden, owners, needs } = matrix
  const left = [...needs]
  const hands: Card[][] = needs.map(() => [])
  const order = shuffled(hidden.length, rng).sort((a, b) => owners[a].length - owners[b].length)
  for (const index of order) {
    const options = owners[index].filter((seat) => left[seat] > 0)
    if (options.length === 0) return null
    const seat = options[Math.floor(rng() * options.length)]
    hands[seat].push(hidden[index])
    left[seat] -= 1
  }
  return hands
}

const DEAL_ATTEMPTS = 30

export function dealHidden(matrix: OwnerMatrix, rng: Rng): Card[][] {
  for (let attempt = 0; attempt < DEAL_ATTEMPTS; attempt++) {
    const hands = tryDeal(matrix, rng)
    if (hands) return hands
  }
  const order = shuffled(matrix.hidden.length, rng)
  const hands: Card[][] = matrix.needs.map(() => [])
  let cursor = 0
  matrix.needs.forEach((need, seat) => {
    for (let taken = 0; taken < need; taken++) hands[seat].push(matrix.hidden[order[cursor++]])
  })
  return hands
}

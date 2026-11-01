import { RULES, cardPoints, createDeck, dominoRow, sameCard } from '@trebol/engine'
import type { Action, Card, DominoView, PlayerView, Rule, TrickView } from '@trebol/engine'
import type { Bot, Rng } from './types'

const NOISE = 0.5

function unseenCards(view: TrickView): Card[] {
  const seen = [
    ...view.tricks.flatMap((trick) => trick.plays),
    ...view.current,
  ].map((play) => play.card)
  return createDeck(view.players).filter(
    (card) =>
      !seen.some((item) => sameCard(item, card)) &&
      !view.hand.some((item) => sameCard(item, card)),
  )
}

function countOut(card: Card, hidden: Card[], direction: 1 | -1): number {
  return hidden.filter(
    (item) => item.suit === card.suit && (item.rank - card.rank) * direction > 0,
  ).length
}

function scoreAvoiding(view: TrickView, card: Card, hidden: Card[], rule: Rule): number {
  const points = cardPoints(card, rule)
  const lead = view.current[0]?.card.suit
  if (lead === undefined) {
    return (countOut(card, hidden, 1) - countOut(card, hidden, -1)) * 10 - points
  }
  if (card.suit !== lead) return 200 + points * 2 + card.rank
  const top = Math.max(
    ...view.current.filter((play) => play.card.suit === lead).map((play) => play.card.rank),
  )
  if (card.rank < top) return 100 + points / 5 + card.rank
  const lastToPlay = view.current.length === view.players - 1
  return lastToPlay ? 50 + card.rank - points : 50 - card.rank - points
}

function scoreCollecting(view: TrickView, card: Card, hidden: Card[], rule: Rule): number {
  const points = cardPoints(card, rule)
  const master = countOut(card, hidden, 1) === 0
  const lead = view.current[0]?.card.suit
  if (lead === undefined) {
    return master ? 100 + points + card.rank : 20 - points * 2 - card.rank
  }
  if (card.suit !== lead) return 50 - points * 3 - card.rank
  const top = Math.max(
    ...view.current.filter((play) => play.card.suit === lead).map((play) => play.card.rank),
  )
  if (card.rank < top) return 50 - points * 2 - card.rank
  if (view.current.length === view.players - 1) return 200 - card.rank
  if (master) return 190 + points
  const inTrick = view.current.reduce((sum, play) => sum + cardPoints(play.card, rule), 0)
  return 60 + inTrick / 5 + card.rank - points * 2
}

function scoreDomino(view: DominoView, card: Card): number {
  const row = dominoRow(card.suit, view.players)
  const position = row.indexOf(card.rank)
  const center = row.indexOf(7)
  const mine = view.hand.filter((item) => item.suit === card.suit)
  if (position === center) return mine.length * 2 - 4
  const outward = position < center ? -1 : 1
  const beyond = mine.filter((item) => {
    const other = row.indexOf(item.rank)
    return (other - position) * outward > 0
  })
  const adjacent = beyond.some((item) => row.indexOf(item.rank) === position + outward)
  return 5 + beyond.length * 3 + (adjacent ? 2 : 0)
}

function scoreCard(view: PlayerView, card: Card, hidden: Card[]): number {
  if (view.kind === 'domino') return scoreDomino(view, card)
  const rule = RULES[view.id]
  return rule.sign === 1
    ? scoreCollecting(view, card, hidden, rule)
    : scoreAvoiding(view, card, hidden, rule)
}

function choose(view: PlayerView, legal: Action[], rng: Rng): Action {
  const hidden = view.kind === 'tricks' ? unseenCards(view) : []
  let best = legal[0]
  let bestScore = -Infinity
  for (const action of legal) {
    if (action.type === 'pass') return action
    const score = scoreCard(view, action.card, hidden) + rng() * NOISE
    if (score > bestScore) {
      best = action
      bestScore = score
    }
  }
  return best
}

export const mediumBot: Bot = { choose }

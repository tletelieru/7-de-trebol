import {
  RULES,
  applyAction,
  cardPoints,
  legalActions,
  scoreGame,
  trickWinner,
  viewFor,
} from '@trebol/engine'
import type { Action, Card, GameState, MatchState, PlayerView, Seat, TrickView } from '@trebol/engine'
import { countOut, mediumBot, unseenCards } from './medium'
import { buildOwnerMatrix, dealHidden } from './owners'
import type { Bot, Rng } from './types'

const DEFAULT_ITERATIONS = 40
const VALUABLE_POINTS = 50
const SAVEABLE_HIGHER_CARDS = 3
const ALLY_WEIGHT = 0.4

function buildState(view: PlayerView, hidden: Card[][]): MatchState {
  const hands = hidden.map((hand, seat) => (seat === view.seat ? view.hand : hand))
  const game: GameState =
    view.kind === 'domino'
      ? {
          kind: 'domino',
          id: 'domino',
          hands,
          turn: view.turn,
          board: view.board,
          moves: view.moves,
          winner: view.winner,
        }
      : {
          kind: 'tricks',
          id: view.id,
          hands,
          turn: view.turn,
          current: view.current,
          tricks: view.tricks,
        }
  return {
    players: view.players,
    rng: 1,
    dealer: view.dealer,
    gameIndex: view.gameIndex,
    game,
    results: [],
    status: 'playing',
  }
}

function rollout(start: MatchState, rng: Rng): number[] {
  let state = start
  while (state.status === 'playing') {
    const seat = state.game.turn
    const action = mediumBot.choose(viewFor(state, seat), legalActions(state, seat), rng)
    state = applyAction(state, action)
  }
  return scoreGame(state).points
}

interface HardOptions {
  iterations?: number
  target?: Seat
}

function utility(view: PlayerView, gained: number[], target: Seat | undefined): number {
  const totals = gained.map(
    (points, seat) =>
      points + view.results.reduce((sum, result) => sum + result.points[seat], 0),
  )
  if (target !== undefined) {
    const allies = totals.filter((_, seat) => seat !== target && seat !== view.seat)
    const allyTotal = allies.reduce((sum, total) => sum + total, 0) * ALLY_WEIGHT
    return totals[view.seat] + allyTotal - totals[target]
  }
  const rivals = totals.filter((_, seat) => seat !== view.seat)
  const mean = rivals.reduce((sum, total) => sum + total, 0) / rivals.length
  return totals[view.seat] - (Math.max(...rivals) + mean) / 2
}

function wouldGiveAway(view: TrickView, card: Card, hidden: Card[]): boolean {
  const master = countOut(card, hidden, 1) === 0
  const lead = view.current[0]?.card.suit
  if (lead === undefined) return !master
  if (card.suit !== lead) return true
  const top = Math.max(
    ...view.current.filter((play) => play.card.suit === lead).map((play) => play.card.rank),
  )
  if (card.rank < top) return true
  return !master && view.current.length < view.players - 1
}

function canPassToAlly(
  view: TrickView,
  card: Card,
  hidden: Card[],
  target: Seat | undefined,
): boolean {
  if (target === undefined || view.current.length === 0) return false
  if (trickWinner(view.current) === target) return false
  return countOut(card, hidden, 1) >= SAVEABLE_HIGHER_CARDS
}

function keepValuableCards(
  view: PlayerView,
  legal: Action[],
  target: Seat | undefined,
): Action[] {
  if (view.kind !== 'tricks') return legal
  const rule = RULES[view.id]
  if (rule.sign !== 1) return legal
  const hidden = unseenCards(view)
  const kept = legal.filter(
    (action) =>
      action.type !== 'play' ||
      cardPoints(action.card, rule) < VALUABLE_POINTS ||
      !wouldGiveAway(view, action.card, hidden) ||
      canPassToAlly(view, action.card, hidden, target),
  )
  return kept.length > 0 ? kept : legal
}

export function createHardBot({ iterations = DEFAULT_ITERATIONS, target }: HardOptions = {}): Bot {
  return {
    choose(view: PlayerView, allowed: Action[], rng: Rng): Action {
      const legal = keepValuableCards(view, allowed, target)
      if (legal.length === 1) return legal[0]
      const matrix = buildOwnerMatrix(view)
      const scores = legal.map(() => 0)
      for (let round = 0; round < iterations; round++) {
        const state = buildState(view, dealHidden(matrix, rng))
        legal.forEach((action, index) => {
          scores[index] += utility(view, rollout(applyAction(state, action), rng), target)
        })
      }
      return legal[scores.indexOf(Math.max(...scores))]
    },
  }
}

export const hardBot = createHardBot()

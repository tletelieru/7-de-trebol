import { applyAction, legalActions, scoreGame, viewFor } from '@trebol/engine'
import type { Action, Card, GameState, MatchState, PlayerView } from '@trebol/engine'
import { mediumBot } from './medium'
import { buildOwnerMatrix, dealHidden } from './owners'
import type { Bot, Rng } from './types'

const DEFAULT_ITERATIONS = 40

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

function utility(view: PlayerView, gained: number[]): number {
  const totals = gained.map(
    (points, seat) =>
      points + view.results.reduce((sum, result) => sum + result.points[seat], 0),
  )
  const rivals = totals.filter((_, seat) => seat !== view.seat)
  const mean = rivals.reduce((sum, total) => sum + total, 0) / rivals.length
  return totals[view.seat] - (Math.max(...rivals) + mean) / 2
}

export function createHardBot(iterations = DEFAULT_ITERATIONS): Bot {
  return {
    choose(view: PlayerView, legal: Action[], rng: Rng): Action {
      if (legal.length === 1) return legal[0]
      const matrix = buildOwnerMatrix(view)
      const scores = legal.map(() => 0)
      for (let round = 0; round < iterations; round++) {
        const state = buildState(view, dealHidden(matrix, rng))
        legal.forEach((action, index) => {
          scores[index] += utility(view, rollout(applyAction(state, action), rng))
        })
      }
      return legal[scores.indexOf(Math.max(...scores))]
    },
  }
}

export const hardBot = createHardBot()

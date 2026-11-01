import { applyAction, createMatch, legalActions, startNextGame, viewFor } from '@trebol/engine'
import type { Card, MatchState, TrickView } from '@trebol/engine'
import { describe, expect, it } from 'vitest'
import { createRng } from './easy'
import { createHardBot } from './hard'
import { buildOwnerMatrix, dealHidden } from './owners'

const card = (suit: Card['suit'], rank: Card['rank']): Card => ({ suit, rank })

function lateView(): TrickView {
  return {
    kind: 'tricks',
    id: 'trebol',
    seat: 0,
    players: 3,
    dealer: 2,
    gameIndex: 0,
    turn: 0,
    hand: [card('spades', 2)],
    handCounts: [1, 1, 1],
    results: [],
    status: 'playing',
    current: [],
    tricks: [
      {
        plays: [
          { seat: 0, card: card('hearts', 2) },
          { seat: 1, card: card('hearts', 3) },
          { seat: 2, card: card('spades', 3) },
        ],
        winner: 1,
      },
    ],
  }
}

describe('owner matrix', () => {
  it('removes a seat from a suit it failed to follow', () => {
    const matrix = buildOwnerMatrix(lateView())
    matrix.hidden
      .filter((item) => item.suit === 'hearts')
      .forEach((item) => {
        expect(matrix.owners[matrix.hidden.indexOf(item)]).not.toContain(2)
      })
  })

  it('deals every hidden card once and respects the known voids', () => {
    const state = createMatch({ players: 4 }, 3)
    const matrix = buildOwnerMatrix(viewFor(state, state.game.turn))
    const hands = dealHidden(matrix, createRng(2))
    expect(hands.flat()).toHaveLength(39)
    hands.forEach((hand, seat) => expect(hand).toHaveLength(matrix.needs[seat]))
  })

  it('places a card when only one seat can hold it', () => {
    const view = lateView()
    view.handCounts = [1, 2, 0]
    const matrix = buildOwnerMatrix(view)
    matrix.owners.forEach((owners) => expect(owners).toEqual([1]))
  })
})

describe('hardBot', () => {
  it.each([3, 4] as const)('plays only legal moves with %i players', (players) => {
    const bot = createHardBot(2)
    const rng = createRng(4)
    let state: MatchState = createMatch({ players }, 4)
    while (state.status !== 'matchOver') {
      if (state.status === 'gameOver') {
        state = startNextGame(state)
        continue
      }
      const seat = state.game.turn
      state = applyAction(state, bot.choose(viewFor(state, seat), legalActions(state, seat), rng))
    }
    expect(state.results).toHaveLength(6)
  })
})

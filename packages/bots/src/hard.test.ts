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

describe('team bots', () => {
  function teamView(hand: Card[], current: TrickView['current']): TrickView {
    const others = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const
    return {
      ...lateView(),
      id: 'todo',
      players: 4,
      seat: 1,
      hand: [...hand, ...others.map((rank) => card('spades', rank))],
      turn: 1,
      handCounts: [12, 13, 13, 13],
      tricks: [],
      current,
    }
  }

  it('never feeds valuable cards to the target', () => {
    const hand = [card('clubs', 7), card('clubs', 4), card('clubs', 13)]
    const toTarget = teamView(hand, [{ seat: 0, card: card('clubs', 14) }])
    const legal = hand.map((item) => ({ type: 'play' as const, seat: 1, card: item }))
    const picks = (view: TrickView) =>
      Array.from({ length: 12 }, (_, seed) =>
        createHardBot({ iterations: 6, target: 0 }).choose(view, legal, createRng(seed + 1)),
      ).filter((action) => action.type === 'play' && action.card.rank === 7).length
    expect(picks(toTarget)).toBe(0)
  })
})

describe('team bots with allies', () => {
  it('keeps a queen it can still win instead of passing it to an ally', () => {
    const others = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const
    const hand = [card('clubs', 12), card('clubs', 3), card('clubs', 4)]
    const view: TrickView = {
      ...lateView(),
      id: 'todo',
      players: 4,
      seat: 1,
      turn: 1,
      hand: [...hand, ...others.map((rank) => card('spades', rank))],
      handCounts: [12, 13, 13, 12],
      tricks: [],
      current: [
        { seat: 3, card: card('clubs', 14) },
        { seat: 0, card: card('clubs', 2) },
      ],
    }
    const legal = hand.map((item) => ({ type: 'play' as const, seat: 1, card: item }))
    for (let seed = 1; seed <= 12; seed++) {
      const action = createHardBot({ iterations: 3, target: 0 }).choose(view, legal, createRng(seed))
      expect(action.type === 'play' && action.card.rank).not.toBe(12)
    }
  })
})

describe('hardBot', () => {
  it('keeps the 7 of clubs in Todo instead of feeding it to a higher card', () => {
    const others = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const
    const hand = [
      card('clubs', 7),
      card('clubs', 4),
      card('clubs', 13),
      ...others.map((rank) => card('spades', rank)),
    ]
    const view: TrickView = {
      ...lateView(),
      id: 'todo',
      players: 4,
      hand,
      turn: 0,
      handCounts: [13, 13, 12, 12],
      tricks: [],
      current: [
        { seat: 2, card: card('clubs', 14) },
        { seat: 3, card: card('clubs', 2) },
      ],
    }
    const legal = hand.slice(0, 3).map((item) => ({ type: 'play' as const, seat: 0, card: item }))
    for (let seed = 1; seed <= 20; seed++) {
      const action = createHardBot({ iterations: 3 }).choose(view, legal, createRng(seed))
      expect(action.type === 'play' && action.card).not.toEqual(card('clubs', 7))
    }
  })

  it.each([3, 4] as const)('plays only legal moves with %i players', (players) => {
    const bot = createHardBot({ iterations: 2 })
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

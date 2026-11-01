import { applyAction, createMatch, legalActions, startNextGame, viewFor } from '@trebol/engine'
import type { Action, Card, MatchState, TrickView } from '@trebol/engine'
import { describe, expect, it } from 'vitest'
import { createRng } from './easy'
import { mediumBot } from './medium'

const card = (suit: Card['suit'], rank: Card['rank']): Card => ({ suit, rank })

function view(id: TrickView['id'], hand: Card[], current: TrickView['current'] = []): TrickView {
  return {
    kind: 'tricks',
    id,
    seat: 0,
    players: 4,
    dealer: 3,
    gameIndex: 0,
    turn: 0,
    hand,
    handCounts: [hand.length, 13, 13, 13],
    results: [],
    status: 'playing',
    current,
    tricks: [],
  }
}

function pick(state: TrickView, legalCards = state.hand): Card {
  const legal: Action[] = legalCards.map((item) => ({ type: 'play', seat: 0, card: item }))
  const action = mediumBot.choose(state, legal, createRng(1))
  if (action.type !== 'play') throw new Error('Expected a card')
  return action.card
}

describe('mediumBot', () => {
  it('does not lead the 7 of clubs when it costs points', () => {
    const hand = [card('clubs', 7), card('hearts', 3), card('spades', 9)]
    expect(pick(view('trebol', hand))).not.toEqual(card('clubs', 7))
  })

  it('dumps the 7 of clubs when void in the lead suit', () => {
    const hand = [card('clubs', 7), card('spades', 14), card('clubs', 3)]
    const state = view('trebol', hand, [{ seat: 3, card: card('hearts', 9) }])
    expect(pick(state)).toEqual(card('clubs', 7))
  })

  it('ducks under the highest card with its top safe card', () => {
    const hand = [card('hearts', 3), card('hearts', 8), card('hearts', 13)]
    const state = view('quinas', hand, [{ seat: 3, card: card('hearts', 10) }])
    expect(pick(state)).toEqual(card('hearts', 8))
  })

  it('keeps the 7 of clubs away from rivals in Todo', () => {
    const hand = [card('clubs', 7), card('spades', 2)]
    const state = view('todo', hand, [{ seat: 3, card: card('hearts', 9) }])
    expect(pick(state)).toEqual(card('spades', 2))
  })

  it('leads a master in a positive game', () => {
    const hand = [card('spades', 14), card('hearts', 4)]
    expect(pick(view('corazones', hand))).toEqual(card('spades', 14))
  })

  it.each([3, 4] as const)('plays only legal moves with %i players', (players) => {
    const rng = createRng(3)
    let state: MatchState = createMatch({ players }, 3)
    while (state.status !== 'matchOver') {
      if (state.status === 'gameOver') {
        state = startNextGame(state)
        continue
      }
      const seat = state.game.turn
      state = applyAction(
        state,
        mediumBot.choose(viewFor(state, seat), legalActions(state, seat), rng),
      )
    }
    expect(state.results).toHaveLength(6)
  })
})

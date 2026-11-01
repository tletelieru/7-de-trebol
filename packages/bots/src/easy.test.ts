import { applyAction, createMatch, legalActions, startNextGame, viewFor } from '@trebol/engine'
import type { MatchState } from '@trebol/engine'
import { describe, expect, it } from 'vitest'
import { createRng, easyBot } from './easy'

describe('easyBot', () => {
  it.each([3, 4] as const)('finishes a match with %i players from views only', (players) => {
    const rng = createRng(5)
    let state: MatchState = createMatch({ players }, 5)
    while (state.status !== 'matchOver') {
      if (state.status === 'gameOver') {
        state = startNextGame(state)
        continue
      }
      const seat = state.game.turn
      state = applyAction(state, easyBot.choose(viewFor(state, seat), legalActions(state, seat), rng))
    }
    expect(state.results).toHaveLength(6)
  })

  it('is repeatable with the same seed', () => {
    const a = createRng(9)
    const b = createRng(9)
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })
})

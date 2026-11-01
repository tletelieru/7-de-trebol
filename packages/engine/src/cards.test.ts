import { describe, expect, it } from 'vitest'
import { createDeck } from './cards'

describe('createDeck', () => {
  it('has 52 unique cards with 4 players', () => {
    const deck = createDeck(4)
    expect(new Set(deck.map((card) => `${card.suit}-${card.rank}`)).size).toBe(52)
  })

  it('drops only the 2 of diamonds with 3 players', () => {
    const deck = createDeck(3)
    expect(deck).toHaveLength(51)
    expect(deck).not.toContainEqual({ suit: 'diamonds', rank: 2 })
  })
})

import { describe, expect, it } from 'vitest'
import { moveItem, sortHand } from './cards'
import { keyCardTone } from './keyCards'

describe('moveItem', () => {
  it('moves forward and backward without losing items', () => {
    expect(moveItem(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd'])
    expect(moveItem(['a', 'b', 'c', 'd'], 3, 1)).toEqual(['a', 'd', 'b', 'c'])
  })
})

describe('sortHand', () => {
  it('puts the Ace last in tricks and first in domino', () => {
    const hand = [
      { suit: 'clubs', rank: 14 },
      { suit: 'clubs', rank: 2 },
    ] as const
    expect(sortHand([...hand], false)[0].rank).toBe(2)
    expect(sortHand([...hand], true)[0].rank).toBe(14)
  })
})

describe('sortHand descending', () => {
  it('sorts high to low inside each suit and keeps colors alternating', () => {
    const hand = [
      { suit: 'diamonds', rank: 3 },
      { suit: 'clubs', rank: 2 },
      { suit: 'hearts', rank: 9 },
      { suit: 'clubs', rank: 13 },
      { suit: 'spades', rank: 4 },
    ] as const
    expect(sortHand([...hand], false, true).map((card) => `${card.suit}${card.rank}`)).toEqual([
      'clubs13',
      'clubs2',
      'hearts9',
      'spades4',
      'diamonds3',
    ])
  })
})

describe('keyCardTone', () => {
  const seven = { suit: 'clubs', rank: 7 } as const
  const queen = { suit: 'spades', rank: 12 } as const
  const heart = { suit: 'hearts', rank: 3 } as const
  const plain = { suit: 'spades', rank: 3 } as const

  it('marks what costs points in negative games', () => {
    expect(keyCardTone(seven, 'trebol')).toBe('danger')
    expect(keyCardTone(queen, 'quinas')).toBe('danger')
    expect(keyCardTone(heart, 'nada')).toBe('danger')
    expect(keyCardTone(seven, 'nada')).toBe('danger')
  })

  it('marks what adds points in positive games', () => {
    expect(keyCardTone(heart, 'corazones')).toBe('bonus')
    expect(keyCardTone(queen, 'todo')).toBe('bonus')
    expect(keyCardTone(seven, 'todo')).toBe('bonus')
  })

  it('leaves other cards and games alone', () => {
    expect(keyCardTone(heart, 'trebol')).toBeNull()
    expect(keyCardTone(seven, 'corazones')).toBeNull()
    expect(keyCardTone(queen, 'corazones')).toBeNull()
    expect(keyCardTone(plain, 'nada')).toBeNull()
    expect(keyCardTone(seven, 'domino')).toBeNull()
  })
})

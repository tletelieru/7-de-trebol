import { describe, expect, it } from 'vitest'
import { DRAW_MS, drawHops } from './dealerDraw'

describe('dealer draw', () => {
  it.each([
    [3, 0],
    [3, 2],
    [4, 1],
    [4, 3],
  ] as const)('hops in turn order for %i players and stops on seat %i', (players, dealer) => {
    const hops = drawHops(players, dealer)
    expect(hops.length).toBeGreaterThan(players)
    expect(hops.at(-1)?.seat).toBe(dealer)
    hops.slice(1).forEach((hop, index) => {
      expect(hop.seat).toBe((hops[index].seat + 1) % players)
    })
  })

  it('starts fast and slows down over the draw', () => {
    const hops = drawHops(4, 2)
    const gaps = hops.slice(1).map((hop, index) => hop.at - hops[index].at)
    expect(hops[0].at).toBe(0)
    expect(hops.at(-1)?.at).toBe(DRAW_MS)
    gaps.slice(1).forEach((gap, index) => expect(gap).toBeGreaterThanOrEqual(gaps[index]))
  })
})

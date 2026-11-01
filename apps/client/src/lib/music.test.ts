import { describe, expect, it } from 'vitest'
import { TRACKS } from './music'
import { trackForGame } from './sound'

describe('music tracks', () => {
  it('keeps the same shape in every track', () => {
    for (const track of Object.values(TRACKS)) {
      expect(track.melody).toHaveLength(64)
      expect(track.chords).toHaveLength(4)
    }
  })

  it('uses a different melody for each mood', () => {
    expect(new Set(Object.values(TRACKS).map((track) => track.melody.join())).size).toBe(4)
  })

  it('picks the track from the sign of the game', () => {
    expect(trackForGame('trebol')).toBe('negative')
    expect(trackForGame('quinas')).toBe('negative')
    expect(trackForGame('nada')).toBe('negative')
    expect(trackForGame('corazones')).toBe('positive')
    expect(trackForGame('todo')).toBe('positive')
    expect(trackForGame('domino')).toBe('domino')
  })
})

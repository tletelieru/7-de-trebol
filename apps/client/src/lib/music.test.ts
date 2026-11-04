import { describe, expect, it } from 'vitest'
import { TRACKS } from './music'
import { GAME_TRACKS } from './sound'

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
    expect(GAME_TRACKS.trebol).toBe('negative')
    expect(GAME_TRACKS.quinas).toBe('negative')
    expect(GAME_TRACKS.nada).toBe('negative')
    expect(GAME_TRACKS.corazones).toBe('positive')
    expect(GAME_TRACKS.todo).toBe('positive')
    expect(GAME_TRACKS.domino).toBe('domino')
  })
})

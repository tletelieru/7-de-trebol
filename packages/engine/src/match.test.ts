import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { GAME_ORDER, SUITS, createDeck, sameCard } from './cards'
import type { Card, GameId, PlayerCount, Seat } from './cards'
import { dominoRow, emptyBoard } from './domino'
import {
  applyAction,
  createMatch,
  legalActions,
  matchTotals,
  matchWinners,
  startNextGame,
  tricksPerGame,
} from './match'
import type { Action, DominoGame, MatchState, TrickGame } from './match'
import { nextRandom } from './rng'
import { viewFor } from './view'

const TOTALS: Record<Exclude<GameId, 'domino'>, Record<PlayerCount, number>> = {
  trebol: { 4: -330, 3: -370 },
  corazones: { 4: 310, 3: 350 },
  quinas: { 4: -380, 3: -420 },
  todo: { 4: 660, 3: 700 },
  nada: { 4: -660, 3: -700 },
}

const seeds = fc.integer({ min: 0, max: 2 ** 31 - 1 })
const playerCounts = fc.constantFrom<PlayerCount>(3, 4)

function step(state: MatchState, rng: number): { state: MatchState; rng: number } {
  const legal = legalActions(state, state.game.turn)
  const random = nextRandom(rng)
  const action = legal[Math.floor(random.value * legal.length)]
  return { state: applyAction(state, action), rng: random.rng }
}

function playGame(start: MatchState, seed: number, visit?: (state: MatchState) => void) {
  let state = start
  let rng = seed
  while (state.status === 'playing') {
    visit?.(state)
    ;({ state, rng } = step(state, rng))
  }
  return { state, rng }
}

function playMatch(players: PlayerCount, seed: number, visit?: (state: MatchState) => void) {
  let state = createMatch({ players }, seed)
  let rng = seed
  const seen: MatchState[] = []
  for (;;) {
    ;({ state, rng } = playGame(state, rng, visit))
    seen.push(state)
    if (state.status === 'matchOver') return { state, finished: seen }
    state = startNextGame(state)
  }
}

function cardsInGame(state: MatchState): Card[] {
  const { game } = state
  const played =
    game.kind === 'domino'
      ? game.moves.flatMap((move) => (move.card ? [move.card] : []))
      : [...game.tricks.flatMap((trick) => trick.plays), ...game.current].map((play) => play.card)
  return [...game.hands.flat(), ...played]
}

function trickState(hands: Card[][], turn: Seat, current: TrickGame['current'] = []): MatchState {
  const game: TrickGame = { kind: 'tricks', id: 'todo', hands, turn, current, tricks: [] }
  return { players: 4, rng: 1, dealer: 3, gameIndex: 3, game, results: [], status: 'playing' }
}

function dominoState(
  players: PlayerCount,
  hands: Card[][],
  turn: Seat,
  board = emptyBoard(),
): MatchState {
  const game: DominoGame = {
    kind: 'domino',
    id: 'domino',
    hands,
    turn,
    board,
    moves: [],
    winner: null,
  }
  return { players, rng: 1, dealer: 0, gameIndex: 5, game, results: [], status: 'playing' }
}

const card = (suit: Card['suit'], rank: Card['rank']): Card => ({ suit, rank })

describe('match properties', () => {
  it('never loses or duplicates a card', () => {
    fc.assert(
      fc.property(playerCounts, seeds, (players, seed) => {
        const deck = createDeck(players)
        playMatch(players, seed, (current) => {
          const cards = cardsInGame(current)
          expect(cards).toHaveLength(deck.length)
          expect(deck.every((item) => cards.some((held) => sameCard(held, item)))).toBe(true)
        })
      }),
      { numRuns: 200 },
    )
  })

  it('plays all six games with fixed totals', () => {
    fc.assert(
      fc.property(playerCounts, seeds, (players, seed) => {
        const { state, finished } = playMatch(players, seed)
        expect(state.results.map((result) => result.game)).toEqual(GAME_ORDER)
        for (const end of finished) {
          const { game } = end
          if (game.kind === 'tricks') {
            expect(game.tricks).toHaveLength(tricksPerGame(players))
            const total = end.results.at(-1)!.points.reduce((sum, points) => sum + points, 0)
            expect(total).toBe(TOTALS[game.id][players])
          }
        }
      }),
      { numRuns: 5000 },
    )
  })

  it('always leaves domino with one winner and scores the rest by cards left', () => {
    fc.assert(
      fc.property(playerCounts, seeds, (players, seed) => {
        const { state } = playMatch(players, seed)
        const { game } = state
        if (game.kind !== 'domino') throw new Error('Expected domino last')
        const result = state.results.at(-1)!
        expect(game.hands[game.winner!]).toHaveLength(0)
        expect(result.points[game.winner!]).toBe(300)
        game.hands.forEach((hand, seat) => {
          if (seat !== game.winner) expect(result.points[seat]).toBe(-10 * hand.length)
        })
      }),
      { numRuns: 300 },
    )
  })

  it('replays identically from the same seed', () => {
    fc.assert(
      fc.property(playerCounts, seeds, (players, seed) => {
        expect(playMatch(players, seed).state).toEqual(playMatch(players, seed).state)
      }),
      { numRuns: 50 },
    )
  })

  it('stays serializable', () => {
    fc.assert(
      fc.property(playerCounts, seeds, (players, seed) => {
        const { state } = playMatch(players, seed)
        expect(JSON.parse(JSON.stringify(state))).toEqual(state)
      }),
      { numRuns: 50 },
    )
  })

  it('rejects every action outside the legal list', () => {
    fc.assert(
      fc.property(playerCounts, seeds, (players, seed) => {
        const deck = createDeck(players)
        playMatch(players, seed, (state) => {
          if (nextRandom(state.rng + state.game.hands.flat().length).value > 0.1) return
          for (let seat = 0; seat < players; seat++) {
            const legal = legalActions(state, seat)
            const actions: Action[] = [
              { type: 'pass', seat },
              ...deck.map((item) => ({ type: 'play' as const, seat, card: item })),
            ]
            for (const action of actions) {
              const allowed = legal.some(
                (option) =>
                  option.type === action.type &&
                  (option.type === 'pass' ||
                    (action.type === 'play' && sameCard(option.card, action.card))),
              )
              if (!allowed) expect(() => applyAction(state, action)).toThrow('Illegal action')
            }
          }
        })
      }),
      { numRuns: 20 },
    )
  })

  it('never shows another player hand in a view', () => {
    fc.assert(
      fc.property(playerCounts, seeds, (players, seed) => {
        playMatch(players, seed, (state) => {
          const view = viewFor(state, 0)
          expect(view).not.toHaveProperty('rng')
          expect(view).not.toHaveProperty('hands')
          expect(view).not.toHaveProperty('game')
          expect(view.hand).toEqual(state.game.hands[0])
          expect(view.handCounts).toEqual(state.game.hands.map((hand) => hand.length))
        })
      }),
      { numRuns: 30 },
    )
  })
})

describe('dealing and turns', () => {
  it.each([
    [3, 17],
    [4, 13],
  ] as const)('deals %i players %i cards each', (players, size) => {
    const state = createMatch({ players }, 7)
    expect(state.game.hands.map((hand) => hand.length)).toEqual(Array(players).fill(size))
  })

  it('leads from the seat right of the dealer and rotates the deal', () => {
    let state = createMatch({ players: 4 }, 11)
    const firstDealer = state.dealer
    expect(state.game.turn).toBe((firstDealer + 1) % 4)
    state = playGame(state, 3).state
    state = startNextGame(state)
    expect(state.dealer).toBe((firstDealer + 1) % 4)
    expect(state.game.turn).toBe((firstDealer + 2) % 4)
    expect(state.game.kind === 'tricks' && state.game.id).toBe('corazones')
  })

  it('refuses to start the next game early', () => {
    expect(() => startNextGame(createMatch({ players: 3 }, 1))).toThrow()
  })
})

describe('tricks', () => {
  it('forces following suit and allows anything when void', () => {
    const hands = [
      [card('hearts', 3), card('spades', 14)],
      [card('clubs', 2)],
      [card('clubs', 3)],
      [card('clubs', 4)],
    ]
    const state = trickState(hands, 0, [{ seat: 3, card: card('hearts', 5) }])
    expect(legalActions(state, 0)).toEqual([
      { type: 'play', seat: 0, card: card('hearts', 3) },
    ])
    const void_ = trickState(hands, 1, [{ seat: 0, card: card('hearts', 5) }])
    expect(legalActions(void_, 1)).toHaveLength(1)
  })

  it('lets the leader open with anything', () => {
    const hands = [[card('clubs', 7), card('hearts', 12)], [], [], []]
    expect(legalActions(trickState(hands, 0), 0)).toHaveLength(2)
  })

  it('awards the trick to the highest card of the lead suit, Ace high', () => {
    let state = trickState(
      [[card('hearts', 2), card('hearts', 3)], [card('hearts', 14), card('spades', 2)], [card('spades', 14), card('spades', 3)], [card('hearts', 13), card('spades', 4)]],
      0,
    )
    state = applyAction(state, { type: 'play', seat: 0, card: card('hearts', 2) })
    state = applyAction(state, { type: 'play', seat: 1, card: card('hearts', 14) })
    state = applyAction(state, { type: 'play', seat: 2, card: card('spades', 14) })
    state = applyAction(state, { type: 'play', seat: 3, card: card('hearts', 13) })
    const { game } = state
    if (game.kind !== 'tricks') throw new Error('Expected tricks')
    expect(game.tricks[0].winner).toBe(1)
    expect(game.turn).toBe(1)
  })

  it('moves turns toward the next seat', () => {
    const hands = [[card('hearts', 2)], [card('hearts', 3)], [card('hearts', 4)], [card('hearts', 5)]]
    const state = applyAction(trickState(hands, 2), { type: 'play', seat: 2, card: card('hearts', 4) })
    expect(state.game.turn).toBe(3)
  })
})

describe('domino', () => {
  it('uses Ace low and King high', () => {
    expect(dominoRow('clubs', 4)).toEqual([14, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])
  })

  it('skips the 2 of diamonds with 3 players only', () => {
    expect(dominoRow('diamonds', 3).slice(0, 2)).toEqual([14, 3])
    expect(dominoRow('hearts', 3).slice(0, 2)).toEqual([14, 2])
    expect(dominoRow('diamonds', 4).slice(0, 2)).toEqual([14, 2])
  })

  it('opens each suit only with its 7', () => {
    const state = dominoState(4, [[card('clubs', 7), card('clubs', 8), card('hearts', 6)], [], [], []], 0)
    expect(legalActions(state, 0)).toEqual([{ type: 'play', seat: 0, card: card('clubs', 7) }])
  })

  it('plays the Ace of diamonds right after the 3 with 3 players', () => {
    const board = { ...emptyBoard(), diamonds: { low: 3 as const, high: 7 as const } }
    const state = dominoState(3, [[card('diamonds', 14)], [card('clubs', 2)], [card('clubs', 3)]], 0, board)
    expect(legalActions(state, 0)).toEqual([{ type: 'play', seat: 0, card: card('diamonds', 14) }])
  })

  it('blocks the Ace until the 2 is down with 4 players', () => {
    const board = { ...emptyBoard(), hearts: { low: 3 as const, high: 7 as const } }
    const state = dominoState(4, [[card('hearts', 14)], [], [], []], 0, board)
    expect(legalActions(state, 0)).toEqual([{ type: 'pass', seat: 0 }])
  })

  it('allows holding a 7 when another play exists', () => {
    const board = { ...emptyBoard(), clubs: { low: 7 as const, high: 7 as const } }
    const state = dominoState(4, [[card('clubs', 8), card('hearts', 7)], [], [], []], 0, board)
    expect(legalActions(state, 0)).toHaveLength(2)
  })

  it('never allows passing with a play available', () => {
    const state = dominoState(4, [[card('clubs', 7)], [], [], []], 0)
    expect(() => applyAction(state, { type: 'pass', seat: 0 })).toThrow('Illegal action')
  })

  it('ends as soon as someone runs out of cards', () => {
    const hands = [[card('clubs', 7)], [card('hearts', 2), card('hearts', 3)], [card('spades', 2)], []]
    const state = applyAction(dominoState(4, hands, 0), {
      type: 'play',
      seat: 0,
      card: card('clubs', 7),
    })
    expect(state.status).toBe('matchOver')
    expect(state.results.at(-1)!.points).toEqual([300, -20, -10, 0])
  })
})

describe('match result', () => {
  it('keeps ties as ties', () => {
    const result = {
      game: 'trebol' as const,
      points: [-10, -10, -350],
      tallies: [],
      winner: null,
      remaining: [],
    }
    const state: MatchState = { ...createMatch({ players: 3 }, 1), results: [result] }
    expect(matchTotals(state)).toEqual([-10, -10, -350])
    expect(matchWinners(state)).toEqual([0, 1])
  })
})

describe('deck', () => {
  it('covers all suits', () => {
    expect(new Set(createDeck(3).map((item) => item.suit))).toEqual(new Set(SUITS))
  })
})

import { GAME_ORDER, createDeck, sameCard } from './cards'
import type { Card, GameId, PlayerCount, Seat } from './cards'
import { dominoPlays, emptyBoard, placeOnBoard } from './domino'
import type { Board } from './domino'
import { nextRandom, shuffle } from './rng'
import { RULES, dominoPoints, tallyPoints, tallyTricks } from './scoring'
import type { GameScore, TrickGameId } from './scoring'

export interface MatchConfig {
  players: PlayerCount
}

export interface Play {
  seat: Seat
  card: Card
}

export interface Trick {
  plays: Play[]
  winner: Seat
}

export interface DominoMove {
  seat: Seat
  card: Card | null
}

export interface TrickGame {
  kind: 'tricks'
  id: TrickGameId
  hands: Card[][]
  turn: Seat
  current: Play[]
  tricks: Trick[]
}

export interface DominoGame {
  kind: 'domino'
  id: 'domino'
  hands: Card[][]
  turn: Seat
  board: Board
  moves: DominoMove[]
  winner: Seat | null
}

export type GameState = TrickGame | DominoGame

export type MatchStatus = 'playing' | 'gameOver' | 'matchOver'

export interface MatchState {
  players: PlayerCount
  rng: number
  dealer: Seat
  gameIndex: number
  game: GameState
  results: GameScore[]
  status: MatchStatus
}

export type Action = { type: 'play'; seat: Seat; card: Card } | { type: 'pass'; seat: Seat }

const DEALS: Record<PlayerCount, number[]> = { 3: [7, 10], 4: [6, 7] }

export function tricksPerGame(players: PlayerCount): number {
  return DEALS[players][0] + DEALS[players][1]
}

function nextSeat(seat: Seat, players: PlayerCount): Seat {
  return (seat + 1) % players
}

function deal(players: PlayerCount, leader: Seat, rng: number) {
  const { items: deck, rng: next } = shuffle(createDeck(players), rng)
  const hands: Card[][] = Array.from({ length: players }, () => [])
  let cursor = 0
  for (const size of DEALS[players]) {
    for (let offset = 0; offset < players; offset++) {
      const seat = (leader + offset) % players
      hands[seat].push(...deck.slice(cursor, cursor + size))
      cursor += size
    }
  }
  return { hands, rng: next }
}

function startGame(id: GameId, players: PlayerCount, dealer: Seat, rng: number) {
  const leader = nextSeat(dealer, players)
  const dealt = deal(players, leader, rng)
  const game: GameState =
    id === 'domino'
      ? {
          kind: 'domino',
          id,
          hands: dealt.hands,
          turn: leader,
          board: emptyBoard(),
          moves: [],
          winner: null,
        }
      : { kind: 'tricks', id, hands: dealt.hands, turn: leader, current: [], tricks: [] }
  return { game, rng: dealt.rng }
}

export function createMatch(config: MatchConfig, seed: number): MatchState {
  const { players } = config
  const random = nextRandom(seed)
  const dealer = Math.floor(random.value * players)
  const { game, rng } = startGame(GAME_ORDER[0], players, dealer, random.rng)
  return { players, rng, dealer, gameIndex: 0, game, results: [], status: 'playing' }
}

export function startNextGame(state: MatchState): MatchState {
  if (state.status !== 'gameOver') throw new Error('The current game has not finished')
  const gameIndex = state.gameIndex + 1
  const dealer = nextSeat(state.dealer, state.players)
  const { game, rng } = startGame(GAME_ORDER[gameIndex], state.players, dealer, state.rng)
  return { ...state, rng, dealer, gameIndex, game, status: 'playing' }
}

function trickPlays(game: TrickGame, hand: Card[]): Card[] {
  const lead = game.current[0]?.card.suit
  const following = hand.filter((card) => card.suit === lead)
  return following.length > 0 ? following : hand
}

export function legalActions(state: MatchState, seat: Seat): Action[] {
  const { game } = state
  if (state.status !== 'playing' || game.turn !== seat) return []
  const hand = game.hands[seat]
  if (game.kind === 'tricks') {
    return trickPlays(game, hand).map((card) => ({ type: 'play', seat, card }))
  }
  const plays = dominoPlays(hand, game.board, state.players)
  if (plays.length === 0) return [{ type: 'pass', seat }]
  return plays.map((card) => ({ type: 'play', seat, card }))
}

function isLegal(state: MatchState, action: Action): boolean {
  return legalActions(state, action.seat).some((legal) => {
    if (legal.type === 'pass' || action.type === 'pass') return legal.type === action.type
    return sameCard(legal.card, action.card)
  })
}

function withoutCard(hands: Card[][], seat: Seat, card: Card): Card[][] {
  return hands.map((hand, index) =>
    index === seat ? hand.filter((held) => !sameCard(held, card)) : hand,
  )
}

export function trickWinner(plays: Play[]): Seat {
  const lead = plays[0].card.suit
  const inSuit = plays.filter((play) => play.card.suit === lead)
  return inSuit.reduce((best, play) => (play.card.rank > best.card.rank ? play : best)).seat
}

function finishGame(state: MatchState): MatchState {
  const results = [...state.results, scoreGame(state)]
  const status = state.gameIndex === GAME_ORDER.length - 1 ? 'matchOver' : 'gameOver'
  return { ...state, results, status }
}

function applyTrickPlay(state: MatchState, game: TrickGame, seat: Seat, card: Card): MatchState {
  const current = [...game.current, { seat, card }]
  const hands = withoutCard(game.hands, seat, card)
  if (current.length < state.players) {
    const turn = nextSeat(seat, state.players)
    return { ...state, game: { ...game, hands, current, turn } }
  }
  const winner = trickWinner(current)
  const tricks = [...game.tricks, { plays: current, winner }]
  const next = { ...state, game: { ...game, hands, current: [], tricks, turn: winner } }
  return tricks.length === tricksPerGame(state.players) ? finishGame(next) : next
}

function applyDominoMove(
  state: MatchState,
  game: DominoGame,
  seat: Seat,
  card: Card | null,
): MatchState {
  const turn = nextSeat(seat, state.players)
  const moves = [...game.moves, { seat, card }]
  if (!card) return { ...state, game: { ...game, moves, turn } }
  const hands = withoutCard(game.hands, seat, card)
  const board = placeOnBoard(game.board, card, state.players)
  const winner = hands[seat].length === 0 ? seat : null
  const next = { ...state, game: { ...game, hands, board, moves, turn, winner } }
  return winner === null ? next : finishGame(next)
}

export function applyAction(state: MatchState, action: Action): MatchState {
  if (!isLegal(state, action)) throw new Error('Illegal action')
  const { game } = state
  if (game.kind === 'domino') {
    const card = action.type === 'play' ? action.card : null
    return applyDominoMove(state, game, action.seat, card)
  }
  if (action.type === 'pass') throw new Error('Illegal action')
  return applyTrickPlay(state, game, action.seat, action.card)
}

export function scoreGame(state: MatchState): GameScore {
  const { game, players } = state
  if (game.kind === 'domino') {
    const remaining = game.hands.map((hand) => hand.length)
    return {
      game: game.id,
      points: dominoPoints(remaining, game.winner),
      tallies: [],
      winner: game.winner,
      remaining,
    }
  }
  const complete = game.tricks.length === tricksPerGame(players)
  const tallies = tallyTricks(game.tricks, players, complete)
  return {
    game: game.id,
    points: tallies.map((tally) => tallyPoints(tally, RULES[game.id])),
    tallies,
    winner: null,
    remaining: [],
  }
}

export function matchTotals(state: MatchState): number[] {
  return Array.from({ length: state.players }, (_, seat) =>
    state.results.reduce((total, result) => total + result.points[seat], 0),
  )
}

export function matchWinners(state: MatchState): Seat[] {
  const totals = matchTotals(state)
  const best = Math.max(...totals)
  return totals.flatMap((total, seat) => (total === best ? [seat] : []))
}

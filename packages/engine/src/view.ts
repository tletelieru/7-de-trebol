import type { Card, PlayerCount, Seat } from './cards'
import type { Board } from './domino'
import type { DominoMove, MatchState, MatchStatus, Play, Trick } from './match'
import type { GameScore, TrickGameId } from './scoring'

interface BaseView {
  seat: Seat
  players: PlayerCount
  dealer: Seat
  gameIndex: number
  turn: Seat
  hand: Card[]
  handCounts: number[]
  results: GameScore[]
  status: MatchStatus
}

export interface TrickView extends BaseView {
  kind: 'tricks'
  id: TrickGameId
  current: Play[]
  tricks: Trick[]
}

export interface DominoView extends BaseView {
  kind: 'domino'
  id: 'domino'
  board: Board
  moves: DominoMove[]
  winner: Seat | null
}

export type PlayerView = TrickView | DominoView

export function viewFor(state: MatchState, seat: Seat): PlayerView {
  const { game } = state
  const base = {
    seat,
    players: state.players,
    dealer: state.dealer,
    gameIndex: state.gameIndex,
    turn: game.turn,
    hand: game.hands[seat],
    handCounts: game.hands.map((hand) => hand.length),
    results: state.results,
    status: state.status,
  }
  if (game.kind === 'domino') {
    return {
      ...base,
      kind: game.kind,
      id: game.id,
      board: game.board,
      moves: game.moves,
      winner: game.winner,
    }
  }
  return { ...base, kind: game.kind, id: game.id, current: game.current, tricks: game.tricks }
}

import { useContext, useEffect, useState } from 'react'
import type { Level } from '@trebol/bots'
import { matchTotals, matchWinners, scoreGame } from '@trebol/engine'
import type { MatchState, PlayerCount, Seat } from '@trebol/engine'
import { useMessages } from '../i18n/messages'
import { SUIT_SYMBOL, rankLabel, seatPosition } from '../lib/cards'
import { saveRecord } from '../lib/history'
import { KeyCardContext } from '../lib/keyCards'
import { clearSavedMatch } from '../lib/savedMatch'
import { SoundContext, trackForGame } from '../lib/sound'
import type { SeatPosition } from '../lib/cards'
import { HUMAN, useMatch } from '../useMatch'
import { BotHand } from './BotHand'
import { DealAnimation } from './DealAnimation'
import { DominoBoard } from './DominoBoard'
import { DominoFlight } from './DominoFlight'
import { Hand } from './Hand'
import { Overlay } from './Overlay'
import { PlayerBadge } from './PlayerBadge'
import { ResultEffect } from './ResultEffect'
import { ScoreTable } from './ScoreTable'
import { TrickArea } from './TrickArea'
import { TricksPanel } from './TricksPanel'

interface Props {
  players: PlayerCount
  seed: number
  level: Level
  highlight: boolean
  restored: MatchState | null
  onExit: () => void
}

function hasPlays(state: MatchState): boolean {
  const { game } = state
  if (state.results.length > 0) return true
  if (game.kind === 'domino') return game.moves.length > 0
  return game.tricks.length > 0 || game.current.length > 0
}

function saveAbandoned(state: MatchState, seed: number, level: Level): void {
  if (state.status === 'matchOver' || !hasPlays(state)) return
  const results = state.status === 'playing' ? [...state.results, scoreGame(state)] : state.results
  saveRecord({
    id: seed,
    finishedAt: Date.now(),
    players: state.players,
    level,
    results,
    totals: matchTotals({ ...state, results }),
    winners: [],
    abandoned: true,
  })
}

function recentlyPassed(state: MatchState, seat: Seat): boolean {
  if (state.game.kind !== 'domino') return false
  const recent = state.game.moves.slice(-(state.players - 1))
  return recent.some((move) => move.seat === seat && move.card === null)
}

export function Table({ players, seed, level, highlight, restored, onExit }: Props) {
  const t = useMessages()
  const { state, holding, dealing, legal, play, pass, next } = useMatch(players, seed, level, restored)
  const [scoresOpen, setScoresOpen] = useState(false)
  const [tricksOpen, setTricksOpen] = useState(false)
  const [exitOpen, setExitOpen] = useState(false)
  const { game } = state
  const myTricks =
    game.kind === 'tricks' ? game.tricks.filter((trick) => trick.winner === HUMAN) : []
  const names = Array.from({ length: players }, (_, seat) =>
    seat === HUMAN ? t.you : t.bot(seat),
  )
  const live = scoreGame(state)
  const sound = useContext(SoundContext)
  const lastMove = game.kind === 'domino' ? game.moves.at(-1) : undefined
  const passes = lastMove && lastMove.card === null
  const moveCount = game.kind === 'domino' ? game.moves.length : 0
  const matchEnded = state.status === 'matchOver' && !holding
  const humanWon = matchWinners(state).includes(HUMAN)

  useEffect(() => {
    sound?.setTrack(trackForGame(game.id))
    return () => sound?.setTrack('intro')
  }, [game.id, sound])

  useEffect(() => {
    if (passes) sound?.knock()
  }, [passes, moveCount, sound])

  useEffect(() => {
    if (matchEnded) sound?.jingle(humanWon)
  }, [matchEnded, humanWon, sound])
  const tallies = live.tallies
  const lastTrick = game.kind === 'tricks' ? game.tricks.at(-1) : undefined
  const shownPlays =
    game.kind === 'tricks' ? (holding && lastTrick ? lastTrick.plays : game.current) : []
  const ended = state.status !== 'playing' && !holding

  const badge = (seat: Seat) => (
    <PlayerBadge
      name={names[seat]}
      cards={game.hands[seat].length}
      tricks={game.kind === 'tricks' ? tallies[seat].tricks : null}
      points={live.points[seat]}
      dealer={state.dealer === seat}
      active={state.status === 'playing' && !holding && game.turn === seat}
      passed={recentlyPassed(state, seat)}
    />
  )

  useEffect(() => {
    if (state.status !== 'matchOver') return
    saveRecord({
      id: seed,
      finishedAt: Date.now(),
      players,
      level,
      results: state.results,
      totals: matchTotals(state),
      winners: matchWinners(state),
    })
  }, [state, seed, players, level])

  const seatAt = (position: SeatPosition) =>
    Array.from({ length: players }, (_, seat) => seat).find(
      (seat) => seatPosition(seat, players) === position,
    )

  const line = (seat: Seat, vertical: boolean) => (
    <BotHand
      key={`${state.gameIndex}-${seat}`}
      cards={game.hands[seat].length}
      active={state.status === 'playing' && !holding && game.turn === seat}
      vertical={vertical}
    />
  )

  const opponents = (['left', 'top', 'right'] as const).flatMap((position) => {
    const seat = seatAt(position)
    return seat === undefined ? [] : [seat]
  })
  const topSeat = seatAt('top')
  const winners = matchWinners(state)
  const totals = matchTotals(state)

  return (
    <KeyCardContext value={highlight ? game.id : null}>
    <main className="no-scrollbar flex min-h-0 flex-1 flex-col gap-2 overflow-x-clip overflow-y-auto overscroll-contain">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setScoresOpen(true)}
          className="min-w-0 flex-1 pixel-box bg-surface px-3 py-1.5 text-left"
        >
          <span className="font-pixel text-xl leading-none">
            {state.gameIndex + 1}. {t.games[game.id]}
          </span>
          <span className="block truncate text-xs text-muted">{t.gameHints[game.id]}</span>
        </button>
        <button
          type="button"
          onClick={() => setScoresOpen(true)}
          className="pixel-button bg-raised px-3 py-1 text-ink"
        >
          {t.scoreTitle}
        </button>
        <button
          type="button"
          onClick={() => setExitOpen(true)}
          className="pixel-button bg-raised px-3 py-1 text-ink"
        >
          {t.exit}
        </button>
      </div>

      <div className="flex justify-between gap-1">
        {opponents.map((seat) => (
          <div key={seat}>{badge(seat)}</div>
        ))}
      </div>

      {topSeat !== undefined && line(topSeat, false)}

      <div className="flex flex-1 items-center gap-2">
        {line(seatAt('left')!, true)}
        <div className="min-w-0 flex-1">
          {game.kind === 'tricks' ? (
            <TrickArea
              plays={shownPlays}
              players={players}
              collectedBy={holding && lastTrick ? lastTrick.winner : null}
            />
          ) : (
            <>
              <p aria-live="polite" className="h-5 text-center text-sm text-gold">
                {lastMove &&
                  (lastMove.card
                    ? t.movePlayed(
                        names[lastMove.seat],
                        `${rankLabel(lastMove.card.rank)} ${SUIT_SYMBOL[lastMove.card.suit]}`,
                      )
                    : t.movePassed(names[lastMove.seat]))}
              </p>
              <DominoBoard
                board={game.board}
                players={players}
                last={lastMove?.card ?? null}
              />
              <DominoFlight
                key={game.moves.length}
                move={lastMove}
                players={players}
              />
            </>
          )}
        </div>
        {line(seatAt('right')!, true)}
      </div>

      <div className="flex flex-col items-center gap-2">
        <Hand
          key={state.gameIndex}
          header={
            <>
              {badge(HUMAN)}
              {game.kind === 'tricks' && (
                <button
                  type="button"
                  onClick={() => setTricksOpen(true)}
                  className="pixel-box bg-raised px-2 py-1 text-xs font-medium"
                >
                  {t.myTricks(myTricks.length)}
                </button>
              )}
            </>
          }
          hand={game.hands[HUMAN]}
          legal={legal}
          aceLow={game.kind === 'domino'}
          dealing={dealing}
          onPlay={play}
          onPass={pass}
        />
      </div>

      {dealing && <DealAnimation players={players} dealer={state.dealer} />}

      {exitOpen && (
        <Overlay title={t.exitTitle} onClose={() => setExitOpen(false)}>
          <p className="font-pixel text-xl leading-tight text-muted">{t.exitBody}</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setExitOpen(false)}
              className="pixel-button bg-raised py-2.5 text-ink"
            >
              {t.keepPlaying}
            </button>
            <button
              type="button"
              onClick={() => {
                saveAbandoned(state, seed, level)
                clearSavedMatch()
                onExit()
              }}
              className="pixel-button bg-rose-700 py-2.5 text-white"
            >
              {t.exitConfirm}
            </button>
          </div>
        </Overlay>
      )}

      {tricksOpen && game.kind === 'tricks' && state.status === 'playing' && (
        <Overlay
          title={t.myTricks(myTricks.length)}
          translucent
          onClose={() => setTricksOpen(false)}
        >
          <TricksPanel tricks={myTricks} allTricks={game.tricks} />
          <button
            type="button"
            onClick={() => setTricksOpen(false)}
            className="pixel-box bg-raised py-2 font-medium"
          >
            {t.close}
          </button>
        </Overlay>
      )}

      {scoresOpen && (
        <Overlay title={t.scoreTitle} onClose={() => setScoresOpen(false)}>
          <ScoreTable
            names={names}
            results={state.results}
            live={state.status === 'playing' ? live : undefined}
          />
          {state.status === 'playing' && <p className="text-xs text-muted">{t.liveScore}</p>}
          <button
            type="button"
            onClick={() => setScoresOpen(false)}
            className="pixel-box bg-raised py-2 font-medium"
          >
            {t.close}
          </button>
        </Overlay>
      )}

      {ended && state.status === 'gameOver' && (
        <Overlay title={t.gameFinished(t.games[game.id])}>
          <ScoreTable names={names} results={state.results} />
          <button
            type="button"
            onClick={() => {
              setTricksOpen(false)
              next()
            }}
            className="pixel-box bg-accent py-2 font-medium text-on-accent"
          >
            {t.nextGame}
          </button>
        </Overlay>
      )}

      {matchEnded && <ResultEffect won={humanWon} />}

      {ended && state.status === 'matchOver' && (
        <Overlay title={t.matchFinished}>
          <p
            className={`text-center font-pixel text-3xl leading-none text-gold ${
              humanWon ? 'result-win' : 'result-lose'
            }`}
          >
            {winners.length > 1
              ? t.tie(winners.map((seat) => names[seat]).join(', '))
              : t.winner(names[winners[0]], totals[winners[0]])}
          </p>
          <ScoreTable names={names} results={state.results} />
          <button
            type="button"
            onClick={onExit}
            className="pixel-box bg-accent py-2 font-medium text-on-accent"
          >
            {t.backHome}
          </button>
        </Overlay>
      )}
    </main>
    </KeyCardContext>
  )
}

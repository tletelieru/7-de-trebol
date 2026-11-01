import { useEffect, useState } from 'react'
import { BOTS, createRng } from '@trebol/bots'
import type { Level } from '@trebol/bots'
import { applyAction, createMatch, legalActions, startNextGame, viewFor } from '@trebol/engine'
import type { Action, Card, MatchState, PlayerCount } from '@trebol/engine'
import type { BotReply, BotRequest } from './botWorker'
import { clearSavedMatch, writeSavedMatch } from './lib/savedMatch'

export const HUMAN = 0

let worker: Worker | null = null
let requestId = 0

function botWorker(): Worker | null {
  if (typeof Worker === 'undefined') return null
  worker ??= new Worker(new URL('./botWorker.ts', import.meta.url), { type: 'module' })
  return worker
}

const BOT_DELAY = 650
const DOMINO_BOT_DELAY = 1300
const TRICK_HOLD = 1250
const DEAL_HOLD = 1500

function isFresh(state: MatchState): boolean {
  const { game } = state
  if (game.kind === 'domino') return game.moves.length === 0
  return game.tricks.length === 0 && game.current.length === 0
}

function holdKey(state: MatchState): string | null {
  const { game } = state
  if (isFresh(state)) return `deal:${state.gameIndex}`
  if (game.kind !== 'tricks' || game.current.length > 0) return null
  return `${state.gameIndex}:${game.tricks.length}`
}

export function useMatch(
  players: PlayerCount,
  seed: number,
  level: Level,
  restored: MatchState | null,
) {
  const [state, setState] = useState(() => restored ?? createMatch({ players }, seed))
  const [rng] = useState(() => createRng(seed))
  const [heldKey, setHeldKey] = useState<string | null>(null)
  const key = holdKey(state)
  const holding = key !== null && key !== heldKey

  useEffect(() => {
    if (state.status === 'matchOver') clearSavedMatch()
    else writeSavedMatch({ state, seed, level })
  }, [state, seed, level])

  useEffect(() => {
    if (holding) {
      const timer = setTimeout(() => setHeldKey(key), isFresh(state) ? DEAL_HOLD : TRICK_HOLD)
      return () => clearTimeout(timer)
    }
    const seat = state.game.turn
    if (state.status !== 'playing' || seat === HUMAN) return
    const delay = state.game.kind === 'domino' ? DOMINO_BOT_DELAY : BOT_DELAY
    const view = viewFor(state, seat)
    const actions = legalActions(state, seat)
    const worker = level === 'easy' ? null : botWorker()
    if (!worker) {
      const timer = setTimeout(() => {
        setState(applyAction(state, BOTS[level].choose(view, actions, rng)))
      }, delay)
      return () => clearTimeout(timer)
    }
    const id = (requestId += 1)
    let delayed = false
    let reply: Action | null = null
    const commit = () => {
      if (delayed && reply) setState(applyAction(state, reply))
    }
    const timer = setTimeout(() => {
      delayed = true
      commit()
    }, delay)
    worker.onmessage = (event: MessageEvent<BotReply>) => {
      if (event.data.id !== id) return
      reply = event.data.action
      commit()
    }
    const seed = Math.floor(rng() * 2 ** 31)
    worker.postMessage({ id, level, view, legal: actions, seed } satisfies BotRequest)
    return () => {
      clearTimeout(timer)
      worker.onmessage = null
    }
  }, [state, holding, key, rng, level])

  const legal: Action[] = holding ? [] : legalActions(state, HUMAN)

  return {
    state,
    holding,
    dealing: holding && isFresh(state),
    legal,
    play: (card: Card) => setState(applyAction(state, { type: 'play', seat: HUMAN, card })),
    pass: () => setState(applyAction(state, { type: 'pass', seat: HUMAN })),
    next: () => setState(startNextGame(state)),
  }
}

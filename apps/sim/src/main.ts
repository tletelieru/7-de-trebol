import { parseArgs } from 'node:util'
import { createHardBot, createRng, easyBot, mediumBot, randomBot } from '@trebol/bots'
import type { Bot } from '@trebol/bots'
import {
  applyAction,
  createMatch,
  legalActions,
  matchTotals,
  matchWinners,
  startNextGame,
  viewFor,
} from '@trebol/engine'
import type { MatchState, PlayerCount } from '@trebol/engine'

const { values } = parseArgs({
  options: {
    matches: { type: 'string', default: '10000' },
    players: { type: 'string', default: '4' },
    seed: { type: 'string', default: '1' },
    hero: { type: 'string', default: 'medium' },
    field: { type: 'string', default: 'easy' },
    iterations: { type: 'string', default: '40' },
  },
})

const CATALOG: Record<string, Bot> = {
  random: randomBot,
  easy: easyBot,
  medium: mediumBot,
  hard: createHardBot({ iterations: Number(values.iterations) }),
}

const matches = Number(values.matches)
const players = Number(values.players) as PlayerCount
const firstSeed = Number(values.seed)
const hero = CATALOG[values.hero]
const field = CATALOG[values.field]
const teams = [0, 1, 2, 3].map((target) =>
  createHardBot({ iterations: Number(values.iterations), target }),
)

if (!Number.isInteger(matches) || matches < 1 || (players !== 3 && players !== 4) || !hero || (!field && values.field !== 'team')) {
  console.error('Usage: pnpm sim --matches <n> --players <3|4> --hero <bot> --field <bot>')
  process.exit(1)
}

function playMatch(seed: number, heroSeat: number): MatchState {
  const rng = createRng(seed)
  let state = createMatch({ players }, seed)
  while (state.status !== 'matchOver') {
    if (state.status === 'gameOver') {
      state = startNextGame(state)
      continue
    }
    const seat = state.game.turn
    const bot =
      seat === heroSeat
        ? hero
        : values.field === 'team'
          ? teams[heroSeat]
          : field
    state = applyAction(state, bot.choose(viewFor(state, seat), legalActions(state, seat), rng))
  }
  return state
}

let wins = 0
let points = 0
let fieldPoints = 0
const started = performance.now()

for (let index = 0; index < matches; index++) {
  const heroSeat = index % players
  const state = playMatch(firstSeed + index, heroSeat)
  if (matchWinners(state).includes(heroSeat)) wins += 1
  matchTotals(state).forEach((total, seat) => {
    if (seat === heroSeat) points += total
    else fieldPoints += total
  })
}

const rate = wins / matches
const margin = 1.96 * Math.sqrt((rate * (1 - rate)) / matches)
const elapsed = performance.now() - started

console.log(`${values.hero} vs ${values.field}, ${players} players, ${matches} matches`)
console.log(`${(elapsed / matches).toFixed(2)} ms/match`)
console.log(
  `wins: ${(rate * 100).toFixed(1)}% ±${(margin * 100).toFixed(1)} (even: ${(100 / players).toFixed(1)}%)`,
)
console.log(`avg points: ${(points / matches).toFixed(1)}`)
console.log(`field avg points: ${(fieldPoints / matches / (players - 1)).toFixed(1)}`)

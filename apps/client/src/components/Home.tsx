import type { Level } from '@trebol/bots'
import { GAME_ORDER } from '@trebol/engine'
import type { Card, PlayerCount } from '@trebol/engine'
import { useMessages } from '../i18n/messages'
import { GameIcon } from './GameSymbol'
import { PlayingCard } from './PlayingCard'

interface Props {
  level: Level
  onLevel: (level: Level) => void
  onRules: () => void
  onHistory: () => void
  onStart: (players: PlayerCount) => void
}

const FAN: { card: Card; tilt: number; lift: number }[] = [
  { card: { suit: 'hearts', rank: 14 }, tilt: -8, lift: 10 },
  { card: { suit: 'clubs', rank: 7 }, tilt: 0, lift: 0 },
  { card: { suit: 'spades', rank: 12 }, tilt: 8, lift: 10 },
]

const PLAYER_OPTIONS: PlayerCount[] = [3, 4]

const LEVELS: Level[] = ['easy', 'medium', 'hard']

export function Home({ level, onLevel, onRules, onHistory, onStart }: Props) {
  const t = useMessages()

  return (
    <main className="flex flex-col items-center gap-6">
      <div aria-hidden="true" className="flex justify-center pt-6">
        {FAN.map(({ card, tilt, lift }) => (
          <PlayingCard
            key={`${card.suit}-${card.rank}`}
            card={card}
            tilt={tilt}
            lift={lift}
            front={tilt === 0}
          />
        ))}
      </div>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="font-pixel text-6xl leading-none">{t.appName}</h1>
        <p className="text-muted">{t.tagline}</p>
      </div>
      <div role="group" aria-label={t.difficulty} className="flex w-full flex-col gap-1">
        <span className="text-center text-sm text-muted">
          {t.difficulty}: {t.levelHints[level]}
        </span>
        <div className="grid grid-cols-3 gap-1 pixel-box bg-surface p-1">
          {LEVELS.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={level === option}
              onClick={() => onLevel(option)}
              className={`pixel-box py-1.5 text-sm font-medium ${
                level === option ? 'bg-raised' : 'text-muted'
              }`}
            >
              {t.levels[option]}
            </button>
          ))}
        </div>
      </div>
      <div className="grid w-full grid-cols-2 gap-2">
        {PLAYER_OPTIONS.map((players) => (
          <button
            key={players}
            type="button"
            onClick={() => onStart(players)}
            className="pixel-box bg-accent py-3 font-pixel text-2xl leading-none text-on-accent"
          >
            {t.playWith(players)}
          </button>
        ))}
      </div>
      <section className="flex w-full flex-col gap-2 pixel-box bg-surface p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-pixel text-2xl leading-none">{t.gamesTitle}</h2>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={onHistory}
              className="pixel-box bg-raised px-2 py-1 text-xs font-medium"
            >
              {t.history}
            </button>
            <button
              type="button"
              onClick={onRules}
              className="pixel-box bg-raised px-2 py-1 text-xs font-medium"
            >
              {t.rules}
            </button>
          </div>
        </div>
        <ol className="grid auto-rows-fr grid-cols-2 gap-1.5">
          {GAME_ORDER.map((game, index) => (
            <li key={game} className="flex items-center gap-1.5 pixel-box bg-raised px-2 py-2 text-sm">
              <span className="font-pixel text-xl leading-none text-gold">{index + 1}</span>
              <GameIcon id={game} />
              <span className="min-w-0 leading-none">{t.games[game]}</span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  )
}

import { GAME_ORDER } from '@trebol/engine'
import type { GameScore } from '@trebol/engine'
import { useMessages } from '../i18n/messages'
import { formatPoints } from '../lib/cards'
import { GameSymbol } from './GameSymbol'
import { Points } from './Points'

interface Props {
  names: string[]
  results: GameScore[]
  live?: GameScore
}

export function ScoreTable({ names, results, live }: Props) {
  const t = useMessages()
  const scores = live ? [...results, live] : results
  const latest = live ? undefined : results.at(-1)?.game
  const totals = names.map((_, seat) =>
    scores.reduce((total, result) => total + result.points[seat], 0),
  )
  const best = Math.max(...totals)

  return (
    <table className="w-full table-fixed border-separate [border-spacing:0.25rem]">
      <thead>
        <tr>
          <th className="w-10" aria-label={t.game} />
          {names.map((name, seat) => {
            const leading = scores.length > 0 && totals[seat] === best
            return (
              <th
                key={name}
                scope="col"
                className={`pixel-box bg-raised px-1 py-1.5 font-normal ${
                  leading ? 'shadow-[inset_0_0_0_2px_var(--gold)]' : ''
                }`}
              >
                <span className="block truncate text-xs text-muted">{name}</span>
                <span className="block font-pixel text-3xl leading-none tabular-nums">
                  {formatPoints(totals[seat])}
                </span>
              </th>
            )
          })}
        </tr>
      </thead>
      <tbody>
        {GAME_ORDER.map((game) => {
          const result = scores.find((item) => item.game === game)
          return (
            <tr key={game}>
              <th
                scope="row"
                title={t.games[game]}
                aria-label={t.games[game]}
                className={`p-0 font-normal ${result ? '' : 'opacity-60'}`}
              >
                <span className={game === live?.game ? 'score-live inline-block' : 'inline-block'}>
                  <GameSymbol id={game} />
                </span>
              </th>
              {names.map((name, seat) => (
                <td key={name} className="p-0">
                  {result ? (
                    <div className={game === latest ? 'score-pop' : ''}>
                      <Points value={result.points[seat]} block />
                    </div>
                  ) : (
                    <div className="h-9 pixel-box bg-raised/30" />
                  )}
                </td>
              ))}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

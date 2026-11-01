import type { Trick } from '@trebol/engine'
import { useMessages } from '../i18n/messages'
import { cardKey } from '../lib/cards'
import { MiniCard } from './MiniCard'

interface Props {
  tricks: Trick[]
  allTricks: Trick[]
}

export function TricksPanel({ tricks, allTricks }: Props) {
  const t = useMessages()

  if (tricks.length === 0) return <p className="text-sm text-muted">{t.noTricks}</p>

  return (
    <ol className="grid grid-cols-2 gap-x-3 gap-y-1.5">
      {tricks.map((trick) => (
        <li key={cardKey(trick.plays[0].card)} className="flex items-center gap-1">
          <span className="w-5 shrink-0 text-center font-pixel text-lg leading-none text-gold">
            {allTricks.indexOf(trick) + 1}
          </span>
          <div className="flex gap-0.5">
            {trick.plays.map(({ seat, card }) => (
              <MiniCard key={cardKey(card)} card={card} highlight={seat === trick.winner} compact />
            ))}
          </div>
        </li>
      ))}
    </ol>
  )
}

import type { Card } from '@trebol/engine'
import { SUIT_ON_CARD, rankLabel } from '../lib/cards'
import { useKeyCardTone } from '../lib/keyCards'
import { PixelIcon } from './PixelIcon'
import { SuitIcon } from './SuitIcon'

interface Props {
  card: Card
  highlight?: boolean
  compact?: boolean
}

const CROWN = ['#..#..#', '#.###.#', '#######', '#######']

const JACK = 11
const ACE = 14

export function MiniCard({ card, highlight = false, compact = false }: Props) {
  const tone = SUIT_ON_CARD[card.suit]
  const edge = highlight ? 'border-gold' : 'border-card-ink'
  const label = rankLabel(card.rank)
  const keyTone = useKeyCardTone(card)
  const marked = keyTone ? `card-${keyTone}` : ''

  if (compact) {
    return (
      <span className="card-shadow block">
        <span
          className={`card-face flex h-11 w-7 flex-col items-center justify-center gap-0.5 border-2 font-pixel text-lg leading-none ${edge} ${tone} ${marked}`}
        >
          {label}
          <SuitIcon suit={card.suit} className="size-3.5" />
        </span>
      </span>
    )
  }

  const isFace = card.rank >= JACK && card.rank < ACE

  return (
    <span className="card-shadow block">
      <span
        className={`card-face relative block h-16 w-11 border-2 font-pixel leading-none ${edge} ${tone} ${marked}`}
      >
        {isFace && <span className="absolute inset-1 border border-gold/70 bg-gold/15" />}
        <span className="absolute top-0.5 left-1 text-lg leading-none">{label}</span>
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 pt-1">
          {isFace && card.rank !== JACK && (
            <PixelIcon rows={CROWN} className="h-2 w-3.5 text-gold" />
          )}
          <SuitIcon suit={card.suit} className={card.rank === ACE ? 'size-8' : 'size-6'} />
        </span>
        <span className="absolute right-1 bottom-0.5 rotate-180 text-lg leading-none">{label}</span>
      </span>
    </span>
  )
}

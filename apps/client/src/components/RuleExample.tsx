import { useMessages } from '../i18n/messages'
import { cardKey } from '../lib/cards'
import type { ExampleItem, RuleExample as Example } from '../lib/ruleExamples'
import { GameSymbol } from './GameSymbol'
import { MiniCard } from './MiniCard'

const MARK_CLASS = {
  win: '',
  removed: 'opacity-40',
  muted: 'opacity-50',
}

function itemKey(item: ExampleItem, index: number): string {
  if ('card' in item) return `${cardKey(item.card)}-${index}`
  if ('game' in item) return item.game
  if ('seat' in item) return `seat-${item.seat}-${index}`
  if ('backs' in item) return `backs-${index}`
  return `${item.text}-${index}`
}

const SEAT_FRAME = {
  dealer: 'border-transparent',
  lead: 'border-gold',
}

function Seat({ seat, tag }: { seat: number; tag?: keyof typeof SEAT_FRAME }) {
  const t = useMessages()
  const frame = tag ? SEAT_FRAME[tag] : 'border-transparent'
  return (
    <span
      className={`flex items-center gap-0.5 self-center pixel-box border-2 bg-raised px-1.5 font-pixel text-base leading-tight ${frame}`}
    >
      {seat === 0 ? t.you : t.bot(seat)}
      {tag === 'dealer' && <span className="text-gold">●</span>}
    </span>
  )
}

function Backs({ count }: { count: number }) {
  return (
    <span className="flex flex-col items-center gap-0.5">
      <span className="flex h-6 items-center">
        {Array.from({ length: count }, (_, index) => (
          <span
            key={index}
            className={`fan-card back-pattern h-6 w-4 ${index > 0 ? '-ml-3' : ''}`}
          />
        ))}
      </span>
      <span className="font-pixel text-sm leading-none text-ink">{count}</span>
    </span>
  )
}

function Item({ item }: { item: ExampleItem }) {
  if ('game' in item) return <GameSymbol id={item.game} />
  if ('seat' in item) return <Seat seat={item.seat} tag={item.tag} />
  if ('backs' in item) return <Backs count={item.backs} />
  if ('text' in item) {
    return (
      <span className="self-center font-pixel text-lg leading-none text-muted">{item.text}</span>
    )
  }
  const markClass = item.mark ? MARK_CLASS[item.mark] : ''
  return (
    <span className="flex flex-col items-center gap-0.5">
      <span className={`relative ${markClass}`}>
        <MiniCard card={item.card} compact highlight={item.mark === 'win'} />
        {item.mark === 'removed' && (
          <span className="absolute inset-0 flex items-center justify-center font-pixel text-3xl leading-none text-table-hearts">
            ×
          </span>
        )}
      </span>
      {item.label && <span className="font-pixel text-sm leading-none text-ink">{item.label}</span>}
    </span>
  )
}

export function RuleExample({ example }: { example: Example }) {
  return (
    <div aria-hidden="true" data-rule-example className="mt-1.5 flex flex-col gap-1.5">
      {example.map((row, rowIndex) => (
        <div key={rowIndex} className="flex flex-wrap items-start gap-1">
          {row.map((item, index) => (
            <Item key={itemKey(item, index)} item={item} />
          ))}
        </div>
      ))}
    </div>
  )
}

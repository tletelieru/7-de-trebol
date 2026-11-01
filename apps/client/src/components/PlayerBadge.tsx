import { useMessages } from '../i18n/messages'
import { Points } from './Points'

interface Props {
  name: string
  cards: number
  tricks: number | null
  points: number
  dealer: boolean
  active: boolean
  passed: boolean
}

export function PlayerBadge({ name, cards, tricks, points, dealer, active, passed }: Props) {
  const t = useMessages()

  return (
    <div
      aria-current={active ? 'true' : undefined}
      className={`relative flex w-28 flex-col items-center whitespace-nowrap pixel-box border-2 bg-surface px-1 py-0.5 text-xs leading-tight ${
        active ? 'turn-glow border-gold' : 'border-transparent'
      }`}
    >
      <span className="flex items-center gap-1 font-pixel text-lg leading-none">
        {name}
        {dealer && (
          <span title={t.dealer} className="text-gold">
            ●
          </span>
        )}
      </span>
      <span className="text-muted">{t.cardsLeft(cards)}</span>
      <span className="flex items-center gap-1 text-muted">
        {tricks !== null && t.tricksWon(tricks)}
        <span key={points} className="score-pop inline-block text-ink">
          <Points value={points} />
        </span>
      </span>
      {passed && (
        <span className="pass-pop absolute inset-x-1 bottom-0.5 bg-raised text-center font-medium text-gold">
          {t.passed}
        </span>
      )}
    </div>
  )
}

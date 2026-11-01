import type { Card } from '@trebol/engine'
import { MiniCard } from './MiniCard'

interface Props {
  card: Card
  highlight?: boolean
}

export function FlipCard({ card, highlight = false }: Props) {
  return (
    <div className="card-flip">
      <div className="flip-face">
        <MiniCard card={card} highlight={highlight} />
      </div>
      <span className="flip-back back-pattern" />
    </div>
  )
}

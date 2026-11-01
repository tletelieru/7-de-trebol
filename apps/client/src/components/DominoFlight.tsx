import type { CSSProperties } from 'react'
import type { DominoMove, PlayerCount } from '@trebol/engine'
import { SEAT_VECTOR, seatPosition } from '../lib/cards'
import { HUMAN } from '../useMatch'
import { FlipCard } from './FlipCard'

interface Props {
  move: DominoMove | undefined
  players: PlayerCount
}

export function DominoFlight({ move, players }: Props) {
  if (!move?.card || move.seat === HUMAN) return null
  const from = SEAT_VECTOR[seatPosition(move.seat, players)]
  const style = { '--from-x': `${from.x}px`, '--from-y': `${from.y}px` } as CSSProperties

  return (
    <div aria-hidden="true" className="domino-flight pointer-events-none fixed top-1/2 left-1/2 z-10">
      <div style={style} className="bot-enter">
        <FlipCard card={move.card} />
      </div>
    </div>
  )
}

import { useLayoutEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import type { Card, DominoMove, PlayerCount, Seat } from '@trebol/engine'
import { SEAT_VECTOR, cardKey, seatPosition } from '../lib/cards'
import { HUMAN } from '../useMatch'
import { FlipCard } from './FlipCard'
import { MiniCard } from './MiniCard'

interface Props {
  move: DominoMove | undefined
  players: PlayerCount
}

function Flight({ card, seat, players }: { card: Card; seat: Seat; players: PlayerCount }) {
  const flight = useRef<HTMLDivElement>(null)
  const from = SEAT_VECTOR[seatPosition(seat, players)]
  const style = { '--from-x': `${from.x}px`, '--from-y': `${from.y}px` } as CSSProperties

  // eslint-disable-next-line local/no-effect -- measures the target cell in the DOM before paint to aim the flight
  useLayoutEffect(() => {
    const cell = document.querySelector(`[data-cell="${cardKey(card)}"]`)
    if (!cell || !flight.current) return
    const rect = cell.getBoundingClientRect()
    const x = rect.left + rect.width / 2 - window.innerWidth / 2
    const y = rect.top + rect.height / 2 - window.innerHeight / 2
    flight.current.style.setProperty('--to-x', `${x}px`)
    flight.current.style.setProperty('--to-y', `${y}px`)
  }, [card])

  return (
    <div
      ref={flight}
      aria-hidden="true"
      style={style}
      className="domino-flight pointer-events-none z-10"
    >
      {seat === HUMAN ? <MiniCard card={card} /> : <FlipCard card={card} />}
    </div>
  )
}

export function DominoFlight({ move, players }: Props) {
  if (!move?.card) return null
  return <Flight card={move.card} seat={move.seat} players={players} />
}

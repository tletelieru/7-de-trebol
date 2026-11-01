import type { CSSProperties } from 'react'
import type { PlayerCount } from '@trebol/engine'
import { SEAT_VECTOR, seatPosition } from '../lib/cards'
import { HUMAN } from '../useMatch'

const FLIGHTS_PER_SEAT = 5

export function DealAnimation({ players, dealer }: { players: PlayerCount; dealer: number }) {
  const seats = Array.from({ length: players }, (_, offset) => (dealer + 1 + offset) % players)

  return (
    <div aria-hidden="true" className="pointer-events-none fixed top-1/2 left-1/2 z-10">
      {Array.from({ length: FLIGHTS_PER_SEAT }, (_, round) =>
        seats
          .filter((seat) => seat !== HUMAN)
          .map((seat, index) => {
            const vector = SEAT_VECTOR[seatPosition(seat, players)]
            const style = {
              '--to-x': `${vector.x}px`,
              '--to-y': `${vector.y}px`,
              '--delay': `${(round * players + index) * 55}ms`,
            } as CSSProperties
            return <span key={`${round}-${seat}`} style={style} className="deal-flight card-back" />
          }),
      )}
    </div>
  )
}

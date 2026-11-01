import type { CSSProperties } from 'react'
import { trickWinner } from '@trebol/engine'
import type { PlayerCount, Play, Seat } from '@trebol/engine'
import { SEAT_VECTOR, seatPosition } from '../lib/cards'
import type { SeatPosition } from '../lib/cards'
import { HUMAN } from '../useMatch'
import { FlipCard } from './FlipCard'
import { MiniCard } from './MiniCard'

interface Props {
  plays: Play[]
  players: PlayerCount
  collectedBy: Seat | null
}

const PLACE: Record<SeatPosition, string> = {
  bottom: 'bottom-0 left-1/2 -translate-x-1/2',
  right: 'right-0 top-1/2 -translate-y-1/2',
  top: 'top-0 left-1/2 -translate-x-1/2',
  left: 'left-0 top-1/2 -translate-y-1/2',
}

export function TrickArea({ plays, players, collectedBy }: Props) {
  const leading = plays.length > 0 ? trickWinner(plays) : null
  const target = collectedBy === null ? null : SEAT_VECTOR[seatPosition(collectedBy, players)]
  const collect = target
    ? ({ '--to-x': `${target.x}px`, '--to-y': `${target.y}px` } as CSSProperties)
    : undefined

  return (
    <div className="relative mx-auto h-40 w-full max-w-44">
      {plays.map(({ seat, card }) => {
        const position = seatPosition(seat, players)
        const from = SEAT_VECTOR[position]
        const enter = { '--from-x': `${from.x}px`, '--from-y': `${from.y}px` } as CSSProperties
        return (
          <div key={seat} className={`absolute ${PLACE[position]}`}>
            <div style={collect} className={target ? 'trick-collect' : ''}>
              {seat === HUMAN ? (
                <div style={enter} className="trick-enter">
                  <MiniCard card={card} highlight={seat === leading} />
                </div>
              ) : (
                <div style={enter} className="bot-enter">
                  <FlipCard card={card} highlight={seat === leading} />
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

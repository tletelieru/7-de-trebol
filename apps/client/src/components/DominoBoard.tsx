import { SUITS, dominoRow } from '@trebol/engine'
import type { Board, PlayerCount, Rank, Suit } from '@trebol/engine'
import { useMessages } from '../i18n/messages'
import { SUIT_ON_TABLE, SUIT_ON_CARD, SUIT_SYMBOL, rankLabel } from '../lib/cards'

interface Props {
  board: Board
  players: PlayerCount
}

function isPlaced(board: Board, suit: Suit, rank: Rank, players: PlayerCount): boolean {
  const placed = board[suit]
  const row = dominoRow(suit, players)
  const position = row.indexOf(rank)
  if (!placed || position < 0) return false
  return position >= row.indexOf(placed.low) && position <= row.indexOf(placed.high)
}

export function DominoBoard({ board, players }: Props) {
  const t = useMessages()

  return (
    <div role="group" aria-label={t.dominoBoard} className="flex w-full flex-col gap-1.5">
      {SUITS.map((suit) => (
        <div key={suit} className="grid grid-cols-[1.25rem_repeat(13,1fr)] items-center gap-px">
          <span className={`text-center ${SUIT_ON_TABLE[suit]}`}>
            {SUIT_SYMBOL[suit]}
          </span>
          {dominoRow(suit, 4).map((rank) => {
            const exists = dominoRow(suit, players).includes(rank)
            const placed = isPlaced(board, suit, rank, players)
            return (
              <span
                key={`${rank}-${placed}`}
                data-placed={placed}
                className={`flex h-9 items-center justify-center font-pixel text-lg leading-none ${
                  placed
                    ? `domino-place bg-card ${SUIT_ON_CARD[suit]}`
                    : exists
                      ? 'bg-raised text-muted'
                      : ''
                }`}
              >
                {exists ? rankLabel(rank) : ''}
              </span>
            )
          })}
        </div>
      ))}
    </div>
  )
}

import type { CSSProperties } from 'react'
import { SUITS, dominoRow, sameCard } from '@trebol/engine'
import type { Board, Card, PlayerCount, Rank, Suit } from '@trebol/engine'
import { useMessages } from '../i18n/messages'
import { SUIT_ON_CARD, SUIT_ON_TABLE, SUIT_SYMBOL, cardKey, rankLabel } from '../lib/cards'

interface Props {
  board: Board
  players: PlayerCount
  last: Card | null
}

const CENTER = 6

function isPlaced(board: Board, suit: Suit, rank: Rank, players: PlayerCount): boolean {
  const placed = board[suit]
  const row = dominoRow(suit, players)
  const position = row.indexOf(rank)
  if (!placed || position < 0) return false
  return position >= row.indexOf(placed.low) && position <= row.indexOf(placed.high)
}

function isComplete(board: Board, suit: Suit, players: PlayerCount): boolean {
  const placed = board[suit]
  const row = dominoRow(suit, players)
  return placed?.low === row[0] && placed.high === row[row.length - 1]
}

export function DominoBoard({ board, players, last }: Props) {
  const t = useMessages()

  return (
    <div role="group" aria-label={t.dominoBoard} className="flex w-full flex-col gap-1">
      {SUITS.map((suit) => {
        const complete = isComplete(board, suit, players)
        return (
          <div key={suit} className="grid grid-cols-[1.25rem_repeat(13,1fr)] items-center gap-px">
            <span className={`text-center ${SUIT_ON_TABLE[suit]}`}>{SUIT_SYMBOL[suit]}</span>
            {dominoRow(suit, 4).map((rank, index) => {
              const exists = dominoRow(suit, players).includes(rank)
              const placed = isPlaced(board, suit, rank, players)
              const isLast = last !== null && sameCard(last, { suit, rank })
              const offset = { '--offset': CENTER - index } as CSSProperties
              return (
                <span
                  key={rank}
                  data-cell={cardKey({ suit, rank })}
                  style={offset}
                  className={`relative flex h-8 ${complete ? 'row-collect' : ''}`}
                >
                  <span
                    key={String(placed)}
                    data-placed={placed}
                    className={`flex flex-1 items-center justify-center font-pixel text-lg leading-none ${
                      placed
                        ? `domino-place bg-card ${SUIT_ON_CARD[suit]} ${
                            isLast ? 'shadow-[inset_0_0_0_2px_var(--gold)]' : ''
                          }`
                        : exists
                          ? 'bg-raised text-muted'
                          : ''
                    }`}
                  >
                    {exists ? rankLabel(rank) : ''}
                  </span>
                </span>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

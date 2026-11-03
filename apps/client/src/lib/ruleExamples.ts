import type { Card, GameId, Rank, Suit } from '@trebol/engine'

export type CardMark = 'win' | 'removed' | 'muted'

export type SeatTag = 'dealer' | 'lead'

export type ExampleItem =
  | { card: Card; mark?: CardMark; label?: string }
  | { game: GameId }
  | { seat: number; tag?: SeatTag }
  | { backs: number }
  | { text: string }

export type RuleExample = ExampleItem[][]

function card(rank: Rank, suit: Suit, mark?: CardMark, label?: string): ExampleItem {
  return { card: { rank, suit }, mark, label }
}

const text = (value: string): ExampleItem => ({ text: value })

const seat = (value: number, tag?: SeatTag): ExampleItem => ({ seat: value, tag })

const backs = (count: number): ExampleItem => ({ backs: count })

export const EXAMPLES = {
  deck: [[card(14, 'clubs'), card(14, 'diamonds'), card(14, 'hearts'), card(14, 'spades')]],
  removedTwo: [
    [card(2, 'clubs'), card(2, 'diamonds', 'removed'), card(2, 'hearts'), card(2, 'spades')],
  ],
  gameOrder: [
    [
      { game: 'trebol' },
      { game: 'corazones' },
      { game: 'quinas' },
      { game: 'todo' },
      { game: 'nada' },
      { game: 'domino' },
    ],
  ],
  lastTrick: [
    [
      card(5, 'spades'),
      card(13, 'spades', 'win'),
      card(9, 'spades'),
      card(2, 'hearts', 'muted'),
      text('10 + 50'),
    ],
  ],
  randomDealer: [[text('?'), seat(0), seat(1, 'dealer'), seat(2), seat(3)]],
  dealRounds: [
    [text('4'), backs(6), text('+'), backs(7)],
    [text('3'), backs(7), text('+'), backs(10)],
  ],
  firstLead: [[seat(0, 'dealer'), text('→'), seat(1, 'lead')]],
  nextDealer: [
    [seat(0, 'dealer'), text('→'), seat(1, 'dealer'), text('→'), seat(2, 'dealer'), text('↺')],
  ],
  followSuit: [
    [card(8, 'hearts'), text('→'), card(11, 'hearts', 'win'), card(13, 'clubs', 'muted')],
  ],
  highestWins: [
    [card(9, 'clubs'), card(12, 'clubs', 'win'), card(14, 'diamonds', 'muted'), card(3, 'clubs')],
  ],
  noTrumps: [[card(4, 'spades'), card(6, 'spades', 'win'), card(14, 'hearts', 'muted')]],
  anyLead: [[card(12, 'spades'), card(7, 'clubs'), card(10, 'hearts')]],
} satisfies Record<string, RuleExample>

export const GAME_EXAMPLES: Record<GameId, RuleExample> = {
  trebol: [[card(7, 'clubs', undefined, '−150'), card(3, 'diamonds', undefined, '−10')]],
  corazones: [
    [
      card(2, 'hearts', undefined, '+10'),
      card(9, 'hearts', undefined, '+10'),
      card(14, 'hearts', undefined, '+10'),
    ],
  ],
  quinas: [
    [
      card(12, 'clubs', undefined, '−50'),
      card(12, 'diamonds', undefined, '−50'),
      card(12, 'hearts', undefined, '−50'),
      card(12, 'spades', undefined, '−50'),
    ],
  ],
  todo: [
    [
      card(7, 'clubs', undefined, '+150'),
      card(12, 'spades', undefined, '+50'),
      card(14, 'hearts', undefined, '+10'),
    ],
  ],
  nada: [
    [
      card(7, 'clubs', undefined, '−150'),
      card(12, 'diamonds', undefined, '−50'),
      card(4, 'hearts', undefined, '−10'),
    ],
  ],
  domino: [
    [
      card(7, 'clubs', 'win'),
      card(7, 'diamonds', 'win'),
      card(7, 'hearts', 'win'),
      card(7, 'spades', 'win'),
    ],
    [
      card(14, 'hearts'),
      text('…'),
      card(6, 'hearts'),
      card(7, 'hearts', 'win'),
      card(8, 'hearts'),
      text('…'),
      card(13, 'hearts'),
    ],
  ],
}

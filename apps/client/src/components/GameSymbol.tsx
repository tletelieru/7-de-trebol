import type { GameId } from '@trebol/engine'
import { PixelIcon } from './PixelIcon'

const BITMAPS: Record<GameId, string[]> = {
  trebol: [
    '######...###...',
    '######..#####..',
    '...##....###...',
    '..##...##.#.##.',
    '..##..#########',
    '.##...#########',
    '.##....##.#.##.',
    '.##.......#....',
    '.##......###...',
  ],
  corazones: [
    '.###...###.',
    '#####.#####',
    '###########',
    '###########',
    '.#########.',
    '..#######..',
    '...#####...',
    '....###....',
    '.....#.....',
  ],
  quinas: [
    '#....#....#',
    '#...###...#',
    '##..###..##',
    '###.###.###',
    '###########',
    '###########',
    '...........',
    '###########',
  ],
  todo: [
    '.....#.....',
    '....###....',
    '....###....',
    '###########',
    '.#########.',
    '..#######..',
    '..#######..',
    '.####.####.',
    '.##.....##.',
  ],
  nada: [
    '##.......##',
    '###.....###',
    '.###...###.',
    '..###.###..',
    '...#####...',
    '....###....',
    '...#####...',
    '..###.###..',
    '.###...###.',
    '###.....###',
    '##.......##',
  ],
  domino: [
    '#############',
    '#.##.#.#.##.#',
    '######.######',
    '###.##.###.##',
    '######.######',
    '#.##.#.#.##.#',
    '#############',
  ],
}

const TONE: Record<GameId, string> = {
  trebol: 'text-ink',
  corazones: 'text-table-hearts',
  quinas: 'text-gold',
  todo: 'text-accent',
  nada: 'text-table-hearts',
  domino: 'text-ink',
}

export function GameIcon({ id }: { id: GameId }) {
  return <PixelIcon rows={BITMAPS[id]} className={`size-6 shrink-0 ${TONE[id]}`} />
}

export function GameSymbol({ id }: { id: GameId }) {
  return (
    <span className="inline-flex size-9 items-center justify-center pixel-box bg-raised align-middle">
      <GameIcon id={id} />
    </span>
  )
}

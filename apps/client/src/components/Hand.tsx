import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent, ReactNode } from 'react'
import { sameCard } from '@trebol/engine'
import type { Action, Card } from '@trebol/engine'
import { useMessages } from '../i18n/messages'
import { SUIT_SYMBOL, cardKey, moveItem, rankLabel, sortHand } from '../lib/cards'
import { readDescending, sortOrderKey } from '../lib/settings'
import { MiniCard } from './MiniCard'

interface Props {
  header: ReactNode
  hand: Card[]
  legal: Action[]
  aceLow: boolean
  dealing: boolean
  onPlay: (card: Card) => void
  onPass: () => void
}

interface Drag {
  key: string
  element: HTMLButtonElement
  startX: number
  startY: number
  grabX: number
  grabY: number
  x: number
  y: number
  moved: boolean
}

const DRAG_THRESHOLD = 6
const CARD_REM = 4
const SLOT_REM = 3
const GAP_REM = 0.25

function isReducedMotion(): boolean {
  return document.documentElement.classList.contains('reduce-motion')
}

export function Hand({ header, hand, legal, aceLow, dealing, onPlay, onPass }: Props) {
  const t = useMessages()
  const [selected, setSelected] = useState<Card | null>(null)
  const [descending, setDescending] = useState(readDescending)
  const [order, setOrder] = useState(() => sortHand(hand, aceLow, descending).map(cardKey))
  const [dragging, setDragging] = useState<string | null>(null)
  const [dealtCards] = useState(hand.length)
  const grid = useRef<HTMLDivElement>(null)
  const drag = useRef<Drag | null>(null)
  const dragged = useRef(false)
  const slots = useRef(new Map<string, { left: number; top: number }>())

  const myTurn = legal.length > 0
  const mustPass = legal.some((action) => action.type === 'pass')
  const isLegal = (card: Card) =>
    legal.some((action) => action.type === 'play' && sameCard(action.card, card))
  const cards = order.flatMap((key) => hand.filter((card) => cardKey(card) === key))
  const sortedKeys = sortHand(hand, aceLow, descending).map(cardKey)
  const isSorted = cards.every((card, index) => cardKey(card) === sortedKeys[index])
  const nextDescending = isSorted ? !descending : descending

  const applySort = () => {
    localStorage.setItem(sortOrderKey, nextDescending ? 'descending' : 'ascending')
    setDescending(nextDescending)
    setOrder(sortHand(hand, aceLow, nextDescending).map(cardKey))
  }

  const place = useCallback(() => {
    const current = drag.current
    const box = grid.current?.getBoundingClientRect()
    if (!current?.moved || !box) return
    const x = current.x - current.grabX - box.left - current.element.offsetLeft
    const y = current.y - current.grabY - box.top - current.element.offsetTop
    current.element.style.translate = `${x}px ${y}px`
  }, [])

  // eslint-disable-next-line local/no-effect -- reserves the hand height from the measured width and on window resize
  useLayoutEffect(() => {
    const reserve = () => {
      const element = grid.current
      if (!element) return
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize)
      const perRow = Math.max(1, Math.floor((element.clientWidth + GAP_REM * rem) / (SLOT_REM * rem)))
      const rows = Math.ceil(dealtCards / perRow)
      element.style.minHeight = `${rows * CARD_REM + (rows - 1) * GAP_REM}rem`
    }
    reserve()
    window.addEventListener('resize', reserve)
    return () => window.removeEventListener('resize', reserve)
  })

  // eslint-disable-next-line local/no-effect -- animates cards from their previous DOM positions after a reorder (FLIP)
  useLayoutEffect(() => {
    place()
    const buttons = grid.current?.querySelectorAll<HTMLButtonElement>('[data-card]') ?? []
    const next = new Map<string, { left: number; top: number }>()
    buttons.forEach((button) => {
      const key = button.dataset.card!
      const slot = { left: button.offsetLeft, top: button.offsetTop }
      const previous = slots.current.get(key)
      next.set(key, slot)
      if (!previous || key === drag.current?.key) return
      const x = previous.left - slot.left
      const y = previous.top - slot.top
      if ((x === 0 && y === 0) || isReducedMotion()) return
      button.animate?.([{ translate: `${x}px ${y}px` }, { translate: '0 0' }], {
        duration: 160,
        easing: 'ease-out',
      })
    })
    slots.current = next
  }, [order, hand.length, place])

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>, key: string) => {
    const element = event.currentTarget
    const rect = element.getBoundingClientRect()
    element.setPointerCapture?.(event.pointerId)
    dragged.current = false
    drag.current = {
      key,
      element,
      startX: event.clientX,
      startY: event.clientY,
      grabX: event.clientX - rect.left,
      grabY: event.clientY - rect.top,
      x: event.clientX,
      y: event.clientY,
      moved: false,
    }
  }

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const current = drag.current
    if (!current) return
    current.x = event.clientX
    current.y = event.clientY
    if (!current.moved) {
      const distance = Math.hypot(event.clientX - current.startX, event.clientY - current.startY)
      if (distance < DRAG_THRESHOLD) return
      current.moved = true
      setDragging(current.key)
    }
    place()
    const box = grid.current?.getBoundingClientRect()
    if (!box) return
    const x = event.clientX - box.left
    const y = event.clientY - box.top
    const from = cards.findIndex((card) => cardKey(card) === current.key)
    const buttons = grid.current?.querySelectorAll<HTMLButtonElement>('[data-card]') ?? []
    for (const [to, button] of [...buttons].entries()) {
      const key = button.dataset.card!
      if (key === current.key) continue
      const { offsetLeft: left, offsetTop: top, offsetWidth: width, offsetHeight: height } = button
      const inside = x >= left && x <= left + width && y >= top && y <= top + height
      if (!inside) continue
      const sameRow = top === current.element.offsetTop
      const center = left + width / 2
      const crossed = !sameRow || (to > from ? x >= center : x <= center)
      if (crossed) {
        setOrder((keys) => moveItem(keys, keys.indexOf(current.key), keys.indexOf(key)))
      }
      break
    }
  }

  const onPointerEnd = () => {
    const current = drag.current
    drag.current = null
    if (!current?.moved) return
    dragged.current = true
    const landing = current.element.style.translate
    current.element.style.translate = ''
    if (isReducedMotion()) {
      setDragging(null)
      return
    }
    current.element.animate?.([{ translate: landing }, { translate: '0 0' }], {
      duration: 140,
      easing: 'ease-out',
    })
    setDragging(null)
  }

  return (
    <section aria-label={t.yourHand} className="flex w-full flex-col items-center gap-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {header}
        <button
          type="button"
          onClick={applySort}
          className="pixel-box bg-raised px-2 py-1 text-xs font-medium"
        >
          {nextDescending ? t.sortDescending : t.sortAscending}
        </button>
        {mustPass && (
          <button
            type="button"
            onClick={onPass}
            className="pixel-box bg-accent px-3 py-1 text-xs font-medium text-on-accent"
          >
            {t.pass}
          </button>
        )}
      </div>
      <p
        aria-live="polite"
        className={`w-full text-center text-sm font-medium text-gold ${myTurn ? '' : 'invisible'}`}
      >
        {mustPass ? t.noMoves : t.yourTurn}
      </p>
      <div ref={grid} className="relative flex w-full flex-wrap content-start justify-center gap-1">
        {cards.map((card, index) => {
          const key = cardKey(card)
          const playable = isLegal(card)
          const picked = selected !== null && sameCard(selected, card)
          const stagger = { '--delay': `${index * 30}ms` } as CSSProperties
          return (
            <button
              key={key}
              type="button"
              data-card={key}
              style={stagger}
              aria-disabled={!playable}
              aria-pressed={picked}
              aria-label={`${rankLabel(card.rank)} ${SUIT_SYMBOL[card.suit]}`}
              onPointerDown={(event) => onPointerDown(event, key)}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerEnd}
              onPointerCancel={onPointerEnd}
              onClick={() => {
                if (dragged.current) {
                  dragged.current = false
                  return
                }
                if (!playable) return
                if (!picked) return setSelected(card)
                setSelected(null)
                onPlay(card)
              }}
              className={`hand-card ${picked ? 'is-picked' : ''} ${
                myTurn && !playable ? 'is-dimmed' : ''
              } ${dragging === key ? 'is-dragging' : ''}`}
            >
              <span className={`block ${dealing ? 'deal-in' : ''}`}>
                <MiniCard card={card} highlight={picked} />
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

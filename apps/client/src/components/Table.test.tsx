import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { RESULT_MS } from '../lib/dealerDraw'

function wait(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}

function skipDraw() {
  while (lit()) {
    act(() => {
      vi.advanceTimersToNextTimer()
    })
  }
}

function savedDealer(): number {
  return JSON.parse(localStorage.getItem('saved-match')!).state.dealer
}

function dealerName(seat: number) {
  return seat === 0 ? 'You' : `Bot ${seat}`
}

function lit() {
  return document.querySelector<HTMLElement>('[data-spotlight]')
}

function button(name: string) {
  return screen.queryByRole('button', { name })
}

function takeTurn() {
  const next = button('Next game')
  if (next) return fireEvent.click(next)
  const pass = button('Pass')
  if (pass) return fireEvent.click(pass)
  const hand = screen.getByRole('region', { name: 'Your hand' })
  const card = hand.querySelector('[data-card][aria-disabled="false"]')
  if (card) {
    fireEvent.click(card)
    fireEvent.click(card)
    return
  }
  act(() => {
    vi.advanceTimersByTime(700)
  })
}

describe('Table', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
    localStorage.setItem('preferred-lang', 'en')
    document.documentElement.className = ''
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it.each([
    ['3 players', 17],
    ['4 players', 13],
  ])('deals the hand for %s', (label, size) => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: label }))
    const hand = screen.getByRole('region', { name: 'Your hand' })
    expect(hand.querySelectorAll('[data-card]')).toHaveLength(size)
  })

  it('opens the panel with the tricks you took', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '4 players' }))
    fireEvent.click(screen.getByRole('button', { name: 'My tricks (0)' }))
    expect(screen.getByText('You have not taken any tricks yet.')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByText('You have not taken any tricks yet.')).toBeNull()
  })

  it('closes the panel when clicking outside but not inside', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '4 players' }))
    fireEvent.click(screen.getByRole('button', { name: 'My tricks (0)' }))
    fireEvent.click(screen.getByRole('dialog'))
    expect(screen.queryByRole('dialog')).not.toBeNull()
    fireEvent.click(screen.getByTestId('overlay-backdrop'))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('asks before leaving a match', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '4 players' }))
    fireEvent.click(screen.getByRole('button', { name: 'Exit' }))
    fireEvent.click(screen.getByRole('button', { name: 'Keep playing' }))
    expect(screen.getByRole('region', { name: 'Your hand' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Exit' }))
    fireEvent.click(screen.getByRole('button', { name: 'Yes, exit' }))
    expect(screen.getByText('The six games')).toBeTruthy()
  })

  it('keeps an abandoned match in the history once a card was played', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '4 players' }))
    skipDraw()
    wait(1600)
    for (let step = 0; step < 6; step++) takeTurn()
    fireEvent.click(screen.getByRole('button', { name: 'Exit' }))
    fireEvent.click(screen.getByRole('button', { name: 'Yes, exit' }))
    fireEvent.click(screen.getByRole('button', { name: 'History' }))
    expect(screen.getByText('Abandoned')).toBeTruthy()
  })

  it('skips the history when nothing was played', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '4 players' }))
    fireEvent.click(screen.getByRole('button', { name: 'Exit' }))
    fireEvent.click(screen.getByRole('button', { name: 'Yes, exit' }))
    expect(localStorage.getItem('match-history')).toBeNull()
  })

  it('comes back to the match after a reload', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '4 players' }))
    skipDraw()
    wait(1600)
    for (let step = 0; step < 6; step++) takeTurn()
    const hand = () =>
      [...screen.getByRole('region', { name: 'Your hand' }).querySelectorAll('[data-card]')]
        .map((card) => card.getAttribute('data-card'))
        .sort()
    const before = hand()
    cleanup()
    render(<App />)
    expect(hand()).toEqual(before)
    fireEvent.click(screen.getByRole('button', { name: 'Exit' }))
    fireEvent.click(screen.getByRole('button', { name: 'Yes, exit' }))
    expect(localStorage.getItem('saved-match')).toBeNull()
  })

  it('shows the score of the game in progress', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '4 players' }))
    fireEvent.click(screen.getByRole('button', { name: 'Score' }))
    expect(screen.getByRole('dialog', { name: 'Score' })).toBeTruthy()
    expect(screen.getByText(/in progress/)).toBeTruthy()
  })

  it('drops the deal animation once the deal ends', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '4 players' }))
    const hand = screen.getByRole('region', { name: 'Your hand' })
    expect(hand.querySelector('.deal-in')).toBeNull()
    skipDraw()
    expect(hand.querySelector('.deal-in')).not.toBeNull()
    wait(1600)
    expect(hand.querySelector('.deal-in')).toBeNull()
  })

  it.each(['3 players', '4 players'])('draws the dealer with %s', (label) => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: label }))
    const dealer = savedDealer()
    const seen: string[] = []
    while (!screen.queryByText(/^Dealer: /)) {
      seen.push(lit()?.textContent ?? '')
      act(() => {
        vi.advanceTimersToNextTimer()
      })
    }
    expect(seen.length).toBeGreaterThan(Number(label[0]))
    expect(screen.getByText(`Dealer: ${dealerName(dealer)}`)).toBeTruthy()
    expect(lit()?.textContent).toContain(dealerName(dealer))
    expect(screen.getByRole('region', { name: 'Your hand' }).querySelector('[data-card] .invisible')).not.toBeNull()
    wait(RESULT_MS)
    expect(screen.queryByText(/^Dealer: /)).toBeNull()
    expect(lit()).toBeNull()
  })

  it('shows the dealer right away with animations off', () => {
    localStorage.setItem('reduce-motion', 'on')
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '4 players' }))
    const dealer = savedDealer()
    expect(screen.getByText(`Dealer: ${dealerName(dealer)}`)).toBeTruthy()
    expect(lit()?.textContent).toContain(dealerName(dealer))
    wait(RESULT_MS)
    expect(screen.queryByText(/^Dealer: /)).toBeNull()
  })

  it('skips the draw for a restored match', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '4 players' }))
    cleanup()
    render(<App />)
    expect(screen.queryByText(/^Dealer: /)).toBeNull()
    expect(lit()).toBeNull()
    wait(1600)
    expect(screen.getByRole('region', { name: 'Your hand' }).querySelector('[data-card] .invisible')).toBeNull()
  })

  it.each(['3 players', '4 players'])('plays a whole match with %s', { timeout: 120000 }, (label) => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: label }))
    let guard = 0
    while (!screen.queryByText('Match finished') && guard < 4000) {
      takeTurn()
      guard += 1
    }
    expect(screen.getByText('Match finished')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Back to start' }))
    expect(screen.getByText('The six games')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'History' }))
    expect(screen.getByText(/^1 played/)).toBeTruthy()
  })
})

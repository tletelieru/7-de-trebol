import type { Level } from '@trebol/bots'

export const levelKey = 'bot-level'

export const fourColorsKey = 'four-colors'

export const sortOrderKey = 'sort-order'

export function readLevel(): Level {
  const saved = localStorage.getItem(levelKey)
  return saved === 'easy' || saved === 'hard' ? saved : 'medium'
}

export const musicKey = 'music'

export function readMusic(): boolean {
  return localStorage.getItem(musicKey) !== 'off'
}

export const highlightKey = 'highlight-cards'

export function readHighlight(): boolean {
  return localStorage.getItem(highlightKey) === 'on'
}

export const plainFontKey = 'plain-font'

export function readPlainFont(): boolean {
  return localStorage.getItem(plainFontKey) === 'on'
}

export const reduceMotionKey = 'reduce-motion'

export function readReduceMotion(): boolean {
  return localStorage.getItem(reduceMotionKey) === 'on'
}

export function readFourColors(): boolean {
  return localStorage.getItem(fourColorsKey) === 'on'
}

export function readDescending(): boolean {
  return localStorage.getItem(sortOrderKey) !== 'ascending'
}

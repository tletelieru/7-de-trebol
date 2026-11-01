import { SUITS } from '@trebol/engine'
import { useMessages } from '../i18n/messages'
import { SUIT_ON_CARD, SUIT_SYMBOL } from '../lib/cards'
import { textSizes } from '../lib/textSize'
import type { TextSize } from '../lib/textSize'
import { Overlay } from './Overlay'

interface Props {
  fourColors: boolean
  onFourColors: (next: boolean) => void
  textSize: TextSize
  onTextSize: (next: TextSize) => void
  reduceMotion: boolean
  onReduceMotion: (next: boolean) => void
  musicOn: boolean
  onMusic: (next: boolean) => void
  highlight: boolean
  onHighlight: (next: boolean) => void
  plainFont: boolean
  onPlainFont: (next: boolean) => void
  onRules: () => void
  onClose: () => void
}

const SAMPLE: Record<TextSize, string> = {
  normal: 'text-sm',
  large: 'text-lg',
  xlarge: 'text-2xl',
}

export function Settings({
  fourColors,
  onFourColors,
  textSize,
  onTextSize,
  reduceMotion,
  onReduceMotion,
  musicOn,
  onMusic,
  highlight,
  onHighlight,
  plainFont,
  onPlainFont,
  onRules,
  onClose,
}: Props) {
  const t = useMessages()

  return (
    <Overlay title={t.settings} onClose={onClose}>
      <div role="group" aria-label={t.textSize} className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">{t.textSize}</span>
        <div className="grid grid-cols-3 gap-1.5">
          {textSizes.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={textSize === option}
              onClick={() => onTextSize(option)}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 pixel-box px-1 py-1.5 text-xs font-medium ${
                textSize === option ? 'bg-accent text-on-accent' : 'bg-raised text-muted'
              }`}
            >
              <span aria-hidden="true" className={`leading-none font-bold ${SAMPLE[option]}`}>
                A
              </span>
              {t.textSizes[option]}
            </button>
          ))}
        </div>
      </div>
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={musicOn}
          onChange={(event) => onMusic(event.target.checked)}
          className="pixel-check"
        />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium">{t.music}</span>
          <span className="block text-xs text-muted">{t.musicHint}</span>
        </span>
      </label>
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={highlight}
          onChange={(event) => onHighlight(event.target.checked)}
          className="pixel-check"
        />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium">{t.highlight}</span>
          <span className="block text-xs text-muted">{t.highlightHint}</span>
        </span>
      </label>
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={plainFont}
          onChange={(event) => onPlainFont(event.target.checked)}
          className="pixel-check"
        />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium">{t.plainFont}</span>
          <span className="block text-xs text-muted">{t.plainFontHint}</span>
        </span>
      </label>
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={reduceMotion}
          onChange={(event) => onReduceMotion(event.target.checked)}
          className="pixel-check"
        />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium">{t.reduceMotion}</span>
          <span className="block text-xs text-muted">{t.reduceMotionHint}</span>
        </span>
      </label>
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={fourColors}
          onChange={(event) => onFourColors(event.target.checked)}
          className="pixel-check"
        />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium">{t.fourColors}</span>
          <span className="block text-xs text-muted">{t.fourColorsHint}</span>
        </span>
      </label>
      <div aria-hidden="true" className="flex justify-center gap-2">
        {SUITS.map((suit) => (
          <span
            key={suit}
            className={`flex size-9 items-center justify-center pixel-box bg-card text-2xl ${SUIT_ON_CARD[suit]}`}
          >
            {SUIT_SYMBOL[suit]}
          </span>
        ))}
      </div>
      <button type="button" onClick={onRules} className="pixel-box bg-raised py-2 font-medium">
        {t.rules}
      </button>
      <button type="button" onClick={onClose} className="pixel-box bg-raised py-2 font-medium">
        {t.close}
      </button>
    </Overlay>
  )
}

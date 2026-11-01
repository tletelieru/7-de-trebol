import { locales } from '../i18n/locales'
import type { Locale } from '../i18n/locales'
import { useLocale, useMessages } from '../i18n/messages'
import type { ColorMode } from '../lib/theme'
import { GearIcon, InstallIcon, MoonIcon, MusicIcon, MusicOffIcon, SunIcon } from './icons'

interface Props {
  mode: ColorMode
  onLocale: (locale: Locale) => void
  onToggleMode: () => void
  onInstall: (() => void) | null
  settingsOpen: boolean
  onSettings: () => void
  compact: boolean
  musicOn: boolean
  onMusic: (next: boolean) => void
}

const iconButton = 'flex size-9 shrink-0 items-center justify-center pixel-box text-muted'

export function Header({
  mode,
  onLocale,
  onToggleMode,
  onInstall,
  settingsOpen,
  onSettings,
  compact,
  musicOn,
  onMusic,
}: Props) {
  const t = useMessages()
  const locale = useLocale()
  const modeLabel = mode === 'dark' ? t.toLight : t.toDark
  const musicLabel = musicOn ? t.musicOff : t.musicOnLabel

  return (
    <header className="flex items-center gap-2">
      <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="size-8 shrink-0" />
      <span className={`min-w-0 flex-1 font-pixel text-2xl ${compact ? 'invisible' : 'truncate'}`}>
        {t.appName}
      </span>
      {onInstall && (
        <button
          type="button"
          aria-label={t.install}
          title={t.install}
          onClick={onInstall}
          className={iconButton}
        >
          <InstallIcon />
        </button>
      )}
      <div role="group" aria-label={t.language} className="flex pixel-box bg-surface p-0.5">
        {locales.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={locale === option}
            onClick={() => onLocale(option)}
            className={`pixel-box px-2 py-1 text-xs font-bold ${
              locale === option ? 'bg-accent text-on-accent' : 'text-muted'
            }`}
          >
            {option.toUpperCase()}
          </button>
        ))}
      </div>
      <button
        type="button"
        aria-label={musicLabel}
        aria-pressed={musicOn}
        title={musicLabel}
        onClick={() => onMusic(!musicOn)}
        className={iconButton}
      >
        {musicOn ? <MusicIcon /> : <MusicOffIcon />}
      </button>
      <button
        type="button"
        aria-label={modeLabel}
        title={modeLabel}
        onClick={onToggleMode}
        className={iconButton}
      >
        {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
      </button>
      <button
        type="button"
        aria-label={t.settings}
        aria-expanded={settingsOpen}
        title={t.settings}
        onClick={onSettings}
        className={iconButton}
      >
        <GearIcon />
      </button>
    </header>
  )
}

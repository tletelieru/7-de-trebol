import { useLocale, useMessages } from '../i18n/messages'
import type { Locale } from '../i18n/locales'

interface OtherGame {
  slug: string
  name: string
  url: string
  tagline: Record<Locale, string>
}

const OTHER_GAMES: OtherGame[] = [
  {
    slug: 'brisca',
    name: 'Brisca',
    url: 'https://tletelieru.github.io/brisca/',
    tagline: {
      en: 'The Spanish-deck trick game with a trump suit, against bots.',
      es: 'El juego de bazas con triunfo y naipe español, contra bots.',
    },
  },
  {
    slug: 'escoba',
    name: 'Escoba',
    url: 'https://tletelieru.github.io/escoba/',
    tagline: {
      en: 'Add up to 15 and sweep the table, against bots.',
      es: 'Suma 15 y barre la mesa, contra bots.',
    },
  },
  {
    slug: 'uno',
    name: 'UNO',
    url: 'https://tletelieru.github.io/uno/',
    tagline: {
      en: 'Match colors and numbers and empty your hand first, against bots.',
      es: 'Junta colores y números y quédate sin cartas primero, contra bots.',
    },
  },
  {
    slug: 'tele',
    name: 'Tele',
    url: 'https://tletelieru.github.io/tele/',
    tagline: {
      en: 'Go out with all 12 cards in trios and runs, against bots.',
      es: 'Bájate con las 12 cartas en tríos y escaleras, contra bots.',
    },
  },
  {
    slug: 'carioca',
    name: 'Carioca',
    url: 'https://tletelieru.github.io/carioca/',
    tagline: {
      en: 'Eight rounds of trios and runs, each with its own contract, against bots.',
      es: 'Ocho rondas de tríos y escalas, cada una con su contrato, contra bots.',
    },
  },
]

export function OtherGames() {
  const t = useMessages()
  const locale = useLocale()

  return (
    <aside aria-label={t.otherGames} className="lg:absolute lg:inset-y-0 lg:left-full lg:w-60">
      <div className="flex flex-col gap-2 lg:sticky lg:top-4">
        <h2 className="font-pixel text-2xl leading-none">{t.otherGames}</h2>
        <ul className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          {OTHER_GAMES.map((game) => (
            <li key={game.slug}>
              <a href={game.url} className="flex h-full items-center gap-2 pixel-box bg-surface p-2">
                <img
                  src={`${import.meta.env.BASE_URL}games/${game.slug}.svg`}
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 shrink-0 [image-rendering:pixelated]"
                />
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="font-pixel text-xl leading-none">{game.name}</span>
                  <span className="text-xs leading-tight text-muted">{game.tagline[locale]}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}

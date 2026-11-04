const CARD_LONG = 1.875
const CARD_SHORT = 1.25
const MAX_SPACING = 0.75
const LINE_REM = { horizontal: 18, vertical: 9 }

interface Props {
  cards: number
  active: boolean
  vertical?: boolean
  concealed?: boolean
}

export function BotHand({ cards, active, vertical = false, concealed = false }: Props) {
  const room = (vertical ? LINE_REM.vertical : LINE_REM.horizontal) - CARD_SHORT
  const spacing = Math.min(cards > 1 ? room / (cards - 1) : 0, MAX_SPACING)
  const overlap = `${spacing - CARD_SHORT}rem`

  return (
    <div
      aria-hidden="true"
      className={`fan-in flex shrink-0 items-center justify-center ${vertical ? 'h-36' : 'h-8'} ${
        concealed ? 'invisible' : ''
      }`}
    >
      <div
        className={`flex items-center justify-center ${vertical ? 'flex-col' : ''} ${
          active ? 'fan-active' : ''
        }`}
      >
        {Array.from({ length: cards }, (_, index) => (
          <span
            key={index}
            style={{
              width: `${vertical ? CARD_LONG : CARD_SHORT}rem`,
              height: `${vertical ? CARD_SHORT : CARD_LONG}rem`,
              ...(index > 0 && (vertical ? { marginTop: overlap } : { marginLeft: overlap })),
            }}
            className="fan-card back-pattern"
          />
        ))}
      </div>
    </div>
  )
}

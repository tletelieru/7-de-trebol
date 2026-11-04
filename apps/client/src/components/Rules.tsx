import { useState } from 'react'
import { GAME_ORDER } from '@trebol/engine'
import { useLocale, useMessages } from '../i18n/messages'
import { rulesText } from '../i18n/rules'
import { KeyCardContext } from '../lib/keyCards'
import { GAME_EXAMPLES } from '../lib/ruleExamples'
import { GameIcon } from './GameSymbol'
import { Overlay } from './Overlay'
import { RuleExample } from './RuleExample'

const GAMES_TAB = 'games'

export function Rules({ onClose }: { onClose: () => void }) {
  const t = useMessages()
  const text = rulesText[useLocale()]
  const [tab, setTab] = useState<number | typeof GAMES_TAB>(0)
  const section = tab === GAMES_TAB ? null : text.sections[tab]

  const tabButton = (id: number | typeof GAMES_TAB, label: string) => (
    <button
      key={id}
      type="button"
      aria-pressed={tab === id}
      onClick={() => setTab(id)}
      className={`pixel-box py-1.5 text-sm ${tab === id ? 'bg-accent text-on-accent' : 'bg-raised'}`}
    >
      {label}
    </button>
  )

  return (
    <Overlay title={t.rules} parchment onClose={onClose}>
      <div className="grid grid-cols-4 gap-1">
        {text.sections.map(({ tab: label }, index) => tabButton(index, label))}
        {tabButton(GAMES_TAB, text.gamesTab)}
      </div>
      {section ? (
        <ul className="flex flex-col gap-2 text-sm leading-tight">
          {section.rules.map(({ text: rule, example }) => (
            <li key={rule} className="flex gap-2">
              <span aria-hidden="true" className="mt-1 size-2 shrink-0 bg-gold" />
              <div className="min-w-0">
                {rule}
                {example && <RuleExample example={example} />}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <ol className="flex flex-col gap-1.5">
          {GAME_ORDER.map((game, index) => (
            <li key={game} className="flex gap-2 pixel-box bg-raised p-2">
              <GameIcon id={game} />
              <div className="min-w-0 leading-tight">
                <h3 className="text-sm">
                  {index + 1}. {t.games[game]}
                </h3>
                <p className="text-xs text-muted">{text.games[game]}</p>
                <KeyCardContext value={game}>
                  <RuleExample example={GAME_EXAMPLES[game]} />
                </KeyCardContext>
              </div>
            </li>
          ))}
        </ol>
      )}
      <button type="button" onClick={onClose} className="pixel-box bg-raised py-2">
        {t.close}
      </button>
    </Overlay>
  )
}

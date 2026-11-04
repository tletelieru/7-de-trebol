import { createContext, useContext } from 'react'
import type { Level } from '@trebol/bots'
import type { GameId } from '@trebol/engine'
import type { TextSize } from '../lib/textSize'
import { defaultLocale } from './locales'
import type { Locale } from './locales'

export interface Messages {
  appName: string
  tagline: string
  gamesTitle: string
  history: string
  historyEmpty: string
  historySummary: (played: number, won: number) => string
  playerCount: (n: number) => string
  outcomes: Record<'won' | 'tied' | 'lost' | 'abandoned', string>
  musicOff: string
  musicOnLabel: string
  rules: string
  games: Record<GameId, string>
  gameHints: Record<GameId, string>
  difficulty: string
  levels: Record<Level, string>
  levelHints: Record<Level, string>
  playWith: (players: number) => string
  you: string
  bot: (n: number) => string
  yourHand: string
  yourTurn: string
  sortDescending: string
  sortAscending: string
  settings: string
  textSize: string
  textSizes: Record<TextSize, string>
  highlight: string
  highlightHint: string
  plainFont: string
  plainFontHint: string
  reduceMotion: string
  reduceMotionHint: string
  fourColors: string
  fourColorsHint: string
  noMoves: string
  pass: string
  passed: string
  dealer: string
  cardsLeft: (n: number) => string
  tricksWon: (n: number) => string
  dominoBoard: string
  movePlayed: (name: string, card: string) => string
  movePassed: (name: string) => string
  exit: string
  exitTitle: string
  exitBody: string
  exitConfirm: string
  keepPlaying: string
  close: string
  scoreTitle: string
  liveScore: string
  myTricks: (n: number) => string
  noTricks: string
  game: string
  total: string
  gameFinished: (game: string) => string
  matchFinished: string
  nextGame: string
  backHome: string
  winner: (name: string, points: number) => string
  tie: (names: string) => string
  toLight: string
  toDark: string
  language: string
  install: string
  developedBy: string
}

export const messages: Record<Locale, Messages> = {
  en: {
    appName: '7 de Trébol',
    tagline: 'The Cocktail card game. Six games against bots.',
    gamesTitle: 'The six games',
    history: 'History',
    historyEmpty: 'Finished matches will appear here.',
    historySummary: (played, won) => `${played} played · ${won} won`,
    playerCount: (n) => `${n} players`,
    outcomes: { won: 'You won', tied: 'Tie', lost: 'You lost', abandoned: 'Abandoned' },
    musicOff: 'Turn music off',
    musicOnLabel: 'Turn music on',
    rules: 'Rules',
    games: {
      trebol: 'Seven of Clubs',
      corazones: 'Hearts',
      quinas: 'Queens',
      todo: 'Everything',
      nada: 'Nothing',
      domino: 'Domino',
    },
    gameHints: {
      trebol: 'Avoid tricks. 7♣ −150, last trick −50.',
      corazones: 'Win tricks and hearts. Last trick +50.',
      quinas: 'Avoid tricks. Each queen −50, last trick −50.',
      todo: 'Win everything. Queens +50, 7♣ +150.',
      nada: 'Avoid everything. Queens −50, 7♣ −150.',
      domino: 'Start from the 7s. First out +300, others −10 per card.',
    },
    difficulty: 'Difficulty',
    levels: { easy: 'Easy', medium: 'Medium', hard: 'Hard' },
    levelHints: {
      easy: 'sensible bots',
      medium: 'bots that think ahead',
      hard: 'bots team up on you',
    },
    playWith: (players) => `${players} players`,
    you: 'You',
    bot: (n) => `Bot ${n}`,
    yourHand: 'Your hand',
    yourTurn: 'Your turn. Tap twice to play, drag to sort.',
    sortDescending: 'High to low',
    sortAscending: 'Low to high',
    settings: 'Settings',
    textSize: 'Text size',
    textSizes: { normal: 'Normal', large: 'Large', xlarge: 'Extra large' },
    highlight: 'Highlight key cards',
    highlightHint: 'Marks the cards worth points in each game: green if they add, red if they subtract.',
    plainFont: 'Plain font',
    plainFontHint: 'Uses a regular font instead of the pixel one.',
    reduceMotion: 'Turn off animations',
    reduceMotionHint: 'Cards appear without flying, flipping or bouncing.',
    fourColors: 'Four-color suits',
    fourColorsHint: 'Clubs green, spades black, hearts red, diamonds orange.',
    noMoves: 'No moves available.',
    pass: 'Pass',
    passed: 'Passed',
    dealer: 'Dealer',
    cardsLeft: (n) => `${n} ${n === 1 ? 'card' : 'cards'}`,
    tricksWon: (n) => `${n} ${n === 1 ? 'trick' : 'tricks'}`,
    dominoBoard: 'Domino board',
    movePlayed: (name, card) => `${name}: ${card}`,
    movePassed: (name) => `${name}: passed`,
    exit: 'Exit',
    exitTitle: 'Leave this match?',
    exitBody: 'You will lose the match in progress.',
    exitConfirm: 'Yes, exit',
    keepPlaying: 'Keep playing',
    close: 'Close',
    scoreTitle: 'Score',
    liveScore: 'The marked game is in progress, so its points can still change.',
    myTricks: (n) => `My tricks (${n})`,
    noTricks: 'You have not taken any tricks yet.',
    game: 'Game',
    total: 'Total',
    gameFinished: (game) => `${game} finished`,
    matchFinished: 'Match finished',
    nextGame: 'Next game',
    backHome: 'Back to start',
    winner: (name, points) => `${name} won with ${points} points`,
    tie: (names) => `Tie: ${names}`,
    toLight: 'Switch to light mode',
    toDark: 'Switch to dark mode',
    language: 'Language',
    install: 'Install app',
    developedBy: 'Developed by',
  },
  es: {
    appName: '7 de Trébol',
    tagline: 'El Cocktail, el juego de naipes. Seis juegos contra bots.',
    gamesTitle: 'Los seis juegos',
    history: 'Historial',
    historyEmpty: 'Aquí aparecerán las partidas terminadas.',
    historySummary: (played, won) => `${played} jugadas · ${won} ganadas`,
    playerCount: (n) => `${n} jugadores`,
    outcomes: { won: 'Ganaste', tied: 'Empate', lost: 'Perdiste', abandoned: 'Abandonada' },
    musicOff: 'Apagar música',
    musicOnLabel: 'Encender música',
    rules: 'Reglas',
    games: {
      trebol: '7 de trébol',
      corazones: 'Corazones',
      quinas: 'Quinas',
      todo: 'Todo',
      nada: 'Nada',
      domino: 'Dominó',
    },
    gameHints: {
      trebol: 'Evita las bazas. 7♣ −150, última −50.',
      corazones: 'Gana bazas y corazones. Última +50.',
      quinas: 'Evita las bazas. Cada quina −50, última −50.',
      todo: 'Gana todo. Quinas +50, 7♣ +150.',
      nada: 'Evita todo. Quinas −50, 7♣ −150.',
      domino: 'Se parte con los 7. Primero +300, los demás −10 por carta.',
    },
    difficulty: 'Dificultad',
    levels: { easy: 'Fácil', medium: 'Medio', hard: 'Difícil' },
    levelHints: {
      easy: 'bots con criterio',
      medium: 'bots que piensan a futuro',
      hard: 'los bots se alían contra ti',
    },
    playWith: (players) => `${players} jugadores`,
    you: 'Tú',
    bot: (n) => `Bot ${n}`,
    yourHand: 'Tu mano',
    yourTurn: 'Tu turno. Toca dos veces para jugar, arrastra para ordenar.',
    sortDescending: 'Mayor a menor',
    sortAscending: 'Menor a mayor',
    settings: 'Ajustes',
    textSize: 'Tamaño del texto',
    textSizes: { normal: 'Normal', large: 'Grande', xlarge: 'Muy grande' },
    highlight: 'Resaltar cartas importantes',
    highlightHint: 'Marca las cartas que valen puntos en cada juego: verde si suman, rojo si restan.',
    plainFont: 'Letra normal',
    plainFontHint: 'Usa una letra común en vez de la pixelada.',
    reduceMotion: 'Desactivar animaciones',
    reduceMotionHint: 'Las cartas aparecen sin volar, girar ni rebotar.',
    fourColors: 'Cuatro colores',
    fourColorsHint: 'Trébol verde, pica negra, corazón rojo, caro naranjo.',
    noMoves: 'No tienes jugada.',
    pass: 'Pasar',
    passed: 'Pasa',
    dealer: 'Repartidor',
    cardsLeft: (n) => `${n} ${n === 1 ? 'carta' : 'cartas'}`,
    tricksWon: (n) => `${n} ${n === 1 ? 'baza' : 'bazas'}`,
    dominoBoard: 'Mesa del dominó',
    movePlayed: (name, card) => `${name}: ${card}`,
    movePassed: (name) => `${name}: pasa`,
    exit: 'Salir',
    exitTitle: '¿Seguro que quieres salir?',
    exitBody: 'Se perderá la partida en curso.',
    exitConfirm: 'Sí, salir',
    keepPlaying: 'Seguir jugando',
    close: 'Cerrar',
    scoreTitle: 'Puntaje',
    liveScore: 'El juego marcado está en curso, así que sus puntos aún pueden cambiar.',
    myTricks: (n) => `Mis bazas (${n})`,
    noTricks: 'Todavía no te has llevado ninguna baza.',
    game: 'Juego',
    total: 'Total',
    gameFinished: (game) => `Fin de ${game}`,
    matchFinished: 'Fin de la partida',
    nextGame: 'Siguiente juego',
    backHome: 'Volver al inicio',
    winner: (name, points) => `Ganador: ${name} con ${points} puntos`,
    tie: (names) => `Empate: ${names}`,
    toLight: 'Cambiar a modo claro',
    toDark: 'Cambiar a modo oscuro',
    language: 'Idioma',
    install: 'Instalar app',
    developedBy: 'Desarrollado por',
  },
}

export const LocaleContext = createContext<Locale>(defaultLocale)

export function useLocale(): Locale {
  return useContext(LocaleContext)
}

export function useMessages(): Messages {
  return messages[useLocale()]
}

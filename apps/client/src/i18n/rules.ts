import type { GameId } from '@trebol/engine'
import type { Locale } from './locales'

interface RuleSection {
  tab: string
  rules: string[]
}

interface RulesText {
  gamesTab: string
  sections: RuleSection[]
  games: Record<GameId, string>
}

export const rulesText: Record<Locale, RulesText> = {
  en: {
    gamesTab: 'Games',
    sections: [
      {
        tab: 'Basics',
        rules: [
          'Trick-taking game with a standard deck, for 3 or 4 players.',
          'With 4 players there are 13 tricks. With 3, the 2 of diamonds is removed and there are 17.',
          'There are 6 games, always in the same order. Highest total after all six wins.',
          'The last trick counts twice: its normal 10 plus the 50 for being last.',
        ],
      },
      {
        tab: 'Deal',
        rules: [
          'The first dealer is random.',
          'Cards are dealt in two rounds: 6 and 7 with 4 players, 7 and 10 with 3 players.',
          'The player to the right of the dealer leads.',
          'In the next game, the player to the right deals. Everything goes counterclockwise.',
        ],
      },
      {
        tab: 'Tricks',
        rules: [
          "You must follow suit. If you can't, play any card.",
          'The trick goes to the highest card of the suit led. 2 is the lowest and Ace the highest.',
          'There are no trumps, so a card off suit never wins the trick.',
          'The leader can play any card, including hearts, queens or the 7 of clubs.',
        ],
      },
    ],
    games: {
      trebol: 'Each trick −10. Taking the 7 of clubs −150. Last trick −50.',
      corazones: 'Each trick +10. Each heart +10. Last trick +50.',
      quinas: 'Each trick −10. Each queen −50. Last trick −50.',
      todo: 'Each trick +10. Each heart +10. Each queen +50. 7 of clubs +150. Last trick +50.',
      nada: 'Each trick −10. Each heart −10. Each queen −50. 7 of clubs −150. Last trick −50.',
      domino:
        'Each suit starts on its 7 and builds down to the Ace and up to the King. Here the Ace is the lowest card. With 3 players the Ace of diamonds follows the 3. You can only pass with no move. The game ends when someone runs out of cards: +300 for them, −10 per card for the rest.',
    },
  },
  es: {
    gamesTab: 'Juegos',
    sections: [
      {
        tab: 'Básico',
        rules: [
          'Juego de basas con naipe inglés, para 3 o 4 jugadores.',
          'Con 4 jugadores son 13 basas. Con 3 se saca el 2 de caro y son 17.',
          'Son 6 juegos, siempre en el mismo orden. Gana el mayor total al final de los seis.',
          'La última basa cuenta doble: sus 10 de basa normal más los 50 de última.',
        ],
      },
      {
        tab: 'Reparto',
        rules: [
          'El primer repartidor sale al azar.',
          'Se reparte en dos tandas: 6 y 7 cartas con 4 jugadores, 7 y 10 con 3 jugadores.',
          'Sale el jugador a la derecha del que repartió.',
          'En el juego siguiente reparte el de la derecha. Todo va en sentido antihorario.',
        ],
      },
      {
        tab: 'Basas',
        rules: [
          'Es obligatorio seguir pinta. Si no se tiene, se tira cualquier carta.',
          'Gana la carta más alta de la pinta que partió. El 2 es la más baja y el As la más alta.',
          'No hay triunfo, así que quien no sigue pinta nunca gana la basa.',
          'Quien parte puede tirar cualquier carta, incluso corazones, quinas o el 7 de trébol.',
        ],
      },
    ],
    games: {
      trebol: 'Cada basa −10. Llevarse el 7 de trébol −150. Última basa −50.',
      corazones: 'Cada basa +10. Cada corazón +10. Última basa +50.',
      quinas: 'Cada basa −10. Cada quina −50. Última basa −50.',
      todo: 'Cada basa +10. Cada corazón +10. Cada quina +50. 7 de trébol +150. Última basa +50.',
      nada: 'Cada basa −10. Cada corazón −10. Cada quina −50. 7 de trébol −150. Última basa −50.',
      domino:
        'Cada pinta parte con su 7, baja hasta el As y sube hasta la K. Aquí el As es la carta más baja. Con 3 jugadores el As de caro sigue al 3. Solo se puede pasar si no hay jugada. El juego termina cuando alguien se queda sin cartas: +300 para esa persona y −10 por carta para los demás.',
    },
  },
}

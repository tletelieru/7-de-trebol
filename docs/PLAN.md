# Plan de desarrollo — 7 de Trébol

Versión jugable del Cocktail: partida completa de 6 juegos contra bots, con online en una fase futura.

Fuentes: Notion "7 de Trébol / Juego con bots" (diseño) y "Cocktail / Contador de puntos" (reglas y puntaje).

## Stack

Decisión: **web en TypeScript**, empaquetada con Tauri (PC) y Capacitor (celular). Godot queda descartado.

- El motor corre igual en cliente, Web Worker y servidor Node. En Godot habría que reescribirlo o montar otro servidor para el online.
- Monte Carlo es CPU intensivo: en TS va a un Web Worker y se puede medir con Vitest. GDScript es más lento y el export web de Godot complica los hilos.
- Se reutilizan `cocktail/src/lib/scoring.ts`, el i18n, el tema y el flujo de PWA de los proyectos ox.
- Se prueba por link con `ox-proxy` desde el primer día.
- Costo aceptado: animaciones, sonido y hápticos se arman a mano, donde Godot los trae resueltos.

| Área | Elección |
| --- | --- |
| Monorepo | pnpm workspaces |
| Lenguaje | TypeScript estricto |
| Mesa | PixiJS 8 (sprites, tweens, filtro CRT) |
| Menús, ajustes, puntaje | React 19 + Tailwind 4 |
| Build | Vite + vite-plugin-pwa |
| Tests | Vitest + fast-check |
| Empaquetado | Tauri 2 y Capacitor (fase 6) |
| Online | Node + WebSockets, servidor autoritativo (fase 7) |

## Estructura

```
apps/
  client/        PWA: mesa, menús, audio
  sim/           CLI de self-play bot contra bot
  server/        fase 7
packages/
  engine/        estado, acciones legales, puntaje. Puro, sin dependencias de UI
  bots/          fácil, medio, difícil
```

## Contrato del motor

```ts
createMatch(config: MatchConfig, seed: number): MatchState
legalActions(state: MatchState, seat: Seat): Action[]
applyAction(state: MatchState, action: Action): MatchState
viewFor(state: MatchState, seat: Seat): PlayerView
scoreGame(state: MatchState): GameScore
```

```ts
interface Bot {
  choose(view: PlayerView, legal: Action[], rng: Rng): Action
}
```

- Estado inmutable y serializable: sirve para guardar partida y para el servidor.
- RNG con semilla: toda partida se puede reproducir.
- Los bots reciben `PlayerView`, nunca `MatchState`. Así no pueden hacer trampa, y el cliente online usa la misma vista.

## Fases

### 0. Base del repo
- Workspace pnpm, TS, ESLint, Vitest y CI (lint, typecheck, test) sobre PRs a `dev` y `main`.
- Cliente vacío con el baseline ox: EN/ES, claro/oscuro, ícono, footer y tema propio, reutilizando `chat-stats` y `tletelieru`.
- Agregar a `ox-proxy/projects.json`: `"7-de-trebol": { "port": 5180, "base": "/7-de-trebol" }`.

Listo cuando: el link de `ox-test` abre el cliente y CI pasa.

### 1. Motor
- Mazo (51 cartas con 3 jugadores, sin 2♦), reparto en dos tandas (7+10 / 6+7) y turnos antihorarios.
- Basas: seguir pinta obligatorio, sin triunfo, salida libre.
- Los 5 juegos de basas y el dominó, incluida la opción de retener los 7.
- Puntaje portado desde `cocktail/src/lib/scoring.ts`.

Listo cuando, con tests de propiedades sobre miles de partidas al azar:
- Cada juego cierra en 13 / 17 basas y ninguna carta se pierde ni se duplica.
- Los totales calzan (4 / 3 jugadores): −330/−370, +310/+350, −380/−420, +660/+700, −660/−700.
- Con 3 jugadores la fila de diamantes termina en el 3.
- Toda acción fuera de `legalActions` se rechaza.

### 2. Jugable de punta a punta
- Bot fácil (carta legal al azar).
- Mesa funcional sin arte final: mano, basa en curso, turnos, dominó, tabla de puntaje y resumen por juego.
- `apps/sim` corre partidas completas por CLI.

Listo cuando: se juega una partida completa de 6 juegos en el celular por link. Primer corte para probar con la familia.

### 3. Bot medio
- Memoria de cartas, carta maestra y heurísticas por juego (Notion, sección 5).
- Función de valor de la mano con pesos ajustables.
- Ajuste de pesos con self-play en `apps/sim`.

Listo cuando: el medio le gana al fácil de forma clara en 10.000 partidas, con intervalo de confianza reportado por `sim`.

### 4. Experiencia visual
- Arte propio pixel art de cartas y mesa, referencia Balatro sin copiarlo.
- Mano en abanico, reordenar arrastrando, tocar dos veces para jugar, cartas no jugables atenuadas.
- Animaciones de reparto, basa y cierre. Filtro CRT opcional.
- Layout mobile first; panel lateral en pantalla ancha.

Listo cuando: pasa revisión con capturas en celular y escritorio.

### 5. Bot difícil
- Matriz de posibles dueños con propagación de restricciones, en un paquete testeado aparte.
- Determinización Monte Carlo en Web Worker, N entre 100 y 500.
- Utilidad por posición en la partida: riesgo, dirigir castigos al líder, guardar castigos.
- Inferencia de intenciones (filtro de partículas) y engaño dentro de jugadas legales.
- Modo debug: matriz y puntaje esperado de cada jugada.

Listo cuando: le gana al medio de forma clara y responde en menos de 1 s en un celular de gama media.

CFR, ISMCTS y aprendizaje por refuerzo quedan fuera salvo que Monte Carlo no alcance.

### 6. Pulido y distribución
- Guardar partida en curso.
- Música, efectos y hápticos con ajustes independientes.
- Panel de conteo opcional.
- Builds Tauri (Windows, Mac, Linux) y Capacitor (Android, iOS).

Listo cuando: los instaladores corren en cada plataforma objetivo.

### 7. Online (futura)
- Salas con código, servidor autoritativo sobre el mismo motor, bots que rellenan o reemplazan a quien se desconecta.
- Se diseña aparte cuando las fases 1 a 5 estén cerradas.

## Reglas por confirmar

Se asumen así hasta que se indique lo contrario:

1. Orden de cartas: 2 la más baja, As la más alta.
2. Dominó: desde el 7 se baja hasta el 2 y se sube hasta el As.
3. Dominó: el juego termina apenas alguien queda sin cartas.
4. Dominó: quien tiene jugada no puede pasar.
5. Empate final: queda como empate, sin desempate por carta.
6. Primer repartidor: al azar.

## Flujo de trabajo

- `main`: estable. `dev`: integración.
- Ramas `feat/*`, `fix/*`, `chore/*` desde `dev`, con PR a `dev`. Release con PR de `dev` a `main`.
- Primera tarea: `feat/workspace-setup` (fase 0).

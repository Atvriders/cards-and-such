# cards-and-such

[![CI](https://github.com/Atvriders/cards-and-such/actions/workflows/ci.yml/badge.svg)](https://github.com/Atvriders/cards-and-such/actions/workflows/ci.yml)
[![Publish images](https://github.com/Atvriders/cards-and-such/actions/workflows/publish-images.yml/badge.svg)](https://github.com/Atvriders/cards-and-such/actions/workflows/publish-images.yml)

A browser-based hub for card, dice, board, arcade, and quiz games — username-only
login, shared leaderboard, achievements, and realtime multiplayer.

**Live demo:** https://cards.waterburp.com

## Quick start

```bash
npm install
npm -w @cards/web run dev        # Vite dev server on :5173
```

The root has no `dev` script; each workspace owns its own. For the full stack
(server + web + WebSocket rooms) bring up the compose stack first, then run the
web dev server against it:

```bash
docker compose up -d             # server on :3050
npm -w @cards/web run dev        # /api and /ws are proxied to the server
```

## Test

```bash
npm test                         # runs vitest in every workspace
npm -w @cards/e2e run test       # Playwright (requires the compose stack up)
```

## Build

```bash
npm run build                    # builds shared + server + web
```

## Architecture

Monorepo, four workspaces:

| Folder    | Package         | What it does                                                  |
|-----------|-----------------|---------------------------------------------------------------|
| `shared/` | `@cards/shared` | Zod schemas, TS types, deterministic multiplayer reducers shared by client and server. |
| `server/` | `@cards/server` | Fastify HTTP API, SQLite (via better-sqlite3), WebSocket hub, room registry, JWT auth. |
| `web/`    | `@cards/web`    | React 18 SPA. All games, the plugin registry, Zustand stores, router, themes, achievements, sounds. |
| `e2e/`    | `@cards/e2e`    | Playwright smoke and multiplayer tests against a running compose stack. |

The web container (nginx + built SPA) is the only host-exposed service. Nginx
reverse-proxies `/api/*` and `/ws` to the server; the server stays internal.
Multiplayer games use a single reducer in `shared/` that both sides import, so
client and server can never disagree on game state.

## Adding a new game

Each game is a self-contained plugin. Five steps:

1. **Create a folder** under `web/src/games/<your-game>/`.
2. **Add `state.ts`** — exports `initialState`, a pure `reducer(state, action)`,
   and `isTerminal(state)`. Write `state.test.ts` next to it.
3. **Add `<YourGame>.tsx`** — the React component. It receives `state` and a
   `dispatch` function; render the board, wire up clicks to dispatch actions.
4. **Add `index.ts`** — export a `GamePlugin` object: `id`, `title`, `category`,
   `players`, `description`, `howToPlay`, `settings`, `initialState`, `reducer`,
   `isTerminal`, `component`. Use `web/src/games/tic-tac-toe/index.ts` as a
   template.
5. **Register it** in `web/src/games/registry.ts` — add the import at the top
   and append the plugin to the `GAMES` array.

That's it. Settings render automatically, scores post to the leaderboard, and
the lobby picks it up on next reload.

## Tech stack

- **React 18** + **react-router-dom** for the SPA shell
- **TypeScript** end-to-end
- **Vite** for dev server and production build
- **Vitest** for unit tests (jsdom for component tests)
- **Zustand** for client state (auth, presence, toasts, stats)
- **Fastify** + **better-sqlite3** + **ws** on the server
- **Zod** for shared schema validation
- **Playwright** for e2e
- **Docker Compose** + **GHCR** for deployment

## What's in the box

- **62 full-rulebook classics** under `web/src/games/<name>-full/` —
  Monopoly, Catan (+ Cities & Knights), Risk, Scrabble, Clue, Battleship,
  Backgammon, Chess (clock), Checkers, Othello, Ticket to Ride, Carcassonne,
  Pandemic, Pandemic Solo, Wingspan, 7 Wonders, Splendor, Dominion, Azul,
  Codenames, Rummikub, Dixit, Boggle, Qwirkle, Trouble, Ludo, Aggravation,
  Parcheesi, Sushi Go Party, Bohnanza, Pictionary, Carrom, Acquire, Trivial
  Pursuit, Power Grid, Terra Mystica, Puerto Rico, Agricola, Caverna, Through
  the Ages, Brass: Birmingham, … (see `docs/backlog-full-board-games.md`)
- ~4,500 game plugins registered (4,466 in `web/src/games/registry.ts`)
- 154 game families collapse variant tiles into pickers (`web/src/games/families.ts`)
- 44 achievements (`web/src/platform/stats.ts`)
- 19 themes (`web/src/platform/themes.ts`)
- Hint coverage: 100% — all 4,505 of 4,505 games have a hint button (see `web/src/games/HINT_COVERAGE.md`)
- Same-seed friend mode: race a friend on the exact same deal, no signup
- Single shared reducer for every multiplayer game — no client/server drift
- Username-only auth, JWT sessions, shared leaderboard, "Online Now" presence

## Recent bug-fix sweep (2026-05)

A multi-agent debug pass audited the platform shell, the tableau / solitaire
engines, the 32 newest full-rulebook plugins, and the 30 original
hand-built classics. The following game-breaking issues were fixed in this
release:

| Game / engine | Severity | Fix |
|---|---|---|
| Klondike (+ 8 variants) | high | Empty tableau columns now require a King, per standard rules. |
| PlayPage tooltips | medium | Z-index bumped, padding/line-height widened so labels no longer clip. |
| Puerto Rico | **critical** | Reducer no longer rejects CPU governor's `pick_role` — game previously soft-locked after the human's first turn. |
| Splendor | **critical** | End-of-round trigger now ends when wrap reaches the trigger seat, not just seat 0 — earlier seats no longer lose their final turn. |
| Splendor | medium | `take3` rejects duplicate colors and enforces "3 distinct" when 3+ piles have tokens. |
| Parcheesi | **critical** | `doublesStreak` resets on non-doubles roll — previously rolling doubles once caused infinite extra turns. |
| Through the Ages | **critical** | `levyMilitary` strength now persists across `recomputeStrength` / `startOfTurnTick` via a new `levyStrength` counter — military levies actually count now. |
| Scrabble | **critical** | Exchange now triggers the 6-consecutive-scoreless-turn end-of-game (previously could loop forever on alternating exchanges). |
| Scrabble | high | Rack-out bonus no longer double-counted at game end. |
| Clue | high | CPU's wrong accusation now ends the human's win (typo `0 ? "lost" : "lost"` returned "lost" for both branches). |
| Sorry! | high | `hasLegalMove` now checks card-7 split feasibility — players no longer forfeit legal split-7 moves. |
| Sequence | high | Cancelling remove-mode now restores the one-eyed Jack to the player's hand (was permanently lost on cancel). |
| King of Tokyo | high | When an attacker outside Tokyo kills the occupant, they now take the empty Tokyo and gain the +1 entry VP. |
| Carcassonne | high | Score/supply arrays deep-copied before in-place mutation, preserving state immutability. |
| Carcassonne | medium | 3-way tie at the top now credits the human as co-winner with `score/winners` instead of 0. |
| Quirkle | high | New `pass` action lets the human escape soft-lock when bag is empty and no legal place or swap exists. |
| Monopoly | medium | Rolling doubles to leave jail no longer grants a second roll (Monopoly rule). |
| PlayPage hint button | medium | Restored W1163/W1169 title pins — `"Hint"`, `"Hint (ready in Ns)"`, or `"No hint available for this game"`. |

The full bug-hunt audit (60+ findings) is summarised in commit history; the
remaining items (Phase 10's missing hit mechanism, Canfield's reserve pile
pickup, the Clock Patience engine's win-detection inversion, the Farkle
engine's `hasFarkleScoringOption` triple miss, Abalone's bent-line selection,
and a handful of `onGameOver` double-fire patterns) are tracked for follow-up.

## Repo layout

```
cards-and-such/
├── shared/        zod schemas, types, multiplayer reducers
├── server/        Fastify + SQLite + WebSocket rooms
├── web/           React SPA + every game plugin
├── e2e/           Playwright tests
├── docs/          specs, plans, game-catalog backlogs
├── docker-compose.yml         pull-only compose (user-facing)
├── docker-compose.ci.yml      CI override that adds local build
└── .env.example
```

## Configuration

Deploy-time settings live in `.env` (copy from `.env.example`):

| Variable      | Default                   | Purpose                                                     |
|---------------|---------------------------|-------------------------------------------------------------|
| `JWT_SECRET`  | *(insecure dev fallback)* | HS256 signing secret. **Always set this in production.**    |
| `CORS_ORIGIN` | `http://localhost:3050`   | Origin the server trusts. Must match the URL users open.    |
| `WEB_PORT`    | `3050`                    | Host port for the SPA + API proxy.                          |
| `IMAGE_TAG`   | `latest`                  | GHCR tag to pull.                                           |

## Contributing

PRs welcome. Run `npm test` and `npm run typecheck` before pushing — CI runs
both on every branch and they must pass. Keep new games self-contained in
their own folder, and put any non-trivial state logic behind a pure reducer
with unit tests. See `CONTRIBUTING.md` for the short version.

## License

MIT — see `LICENSE` if present, otherwise this project is offered under the
standard MIT terms.
<!-- regenerated 2026-05-14T19:29:34Z -->

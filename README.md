# cards-and-such

[![CI](https://github.com/Atvriders/cards-and-such/actions/workflows/ci.yml/badge.svg)](https://github.com/Atvriders/cards-and-such/actions/workflows/ci.yml)
[![Publish images](https://github.com/Atvriders/cards-and-such/actions/workflows/publish-images.yml/badge.svg)](https://github.com/Atvriders/cards-and-such/actions/workflows/publish-images.yml)

Browser-based game hub for card, dice, board, and arcade games. Username-only
login, shared leaderboard, live "Online Now" presence, and realtime multiplayer.
Ten polished launch games; a 2,400-game backlog to draw from next.

Full Phase 1 design at
[`docs/superpowers/specs/2026-04-20-cards-and-such-phase-1-design.md`](docs/superpowers/specs/2026-04-20-cards-and-such-phase-1-design.md).

---

## Status

| Plan | State |
|---|---|
| **A — Platform Foundation** | complete — monorepo, auth, presence, leaderboard, Docker, CI |
| **B — Single-Player Games** | complete — plugin system, 4 shared engines, 8 single-player games |
| **C — Multiplayer + Polish** | complete — authoritative rooms, 2 online games, toasts, reconnect |

228 unit tests + 3 Playwright e2e tests. All green on every push.

## The 10 launch games

| # | Game | Category | Mode |
|---|------|----------|------|
| 1 | **Klondike Solitaire** | solitaire | single-player |
| 2 | **FreeCell** | solitaire | single-player |
| 3 | **Blackjack** | cards (deck) | single-player vs. dealer |
| 4 | **Video Poker** | cards (deck) | single-player (Jacks-or-Better) |
| 5 | **Yahtzee-style** | dice | single-player |
| 6 | **Farkle** | dice | single-player |
| 7 | **Tic-Tac-Toe** | board (grid) | vs. minimax bot or hot-seat |
| 8 | **Checkers** | board (grid) | vs. minimax bot or hot-seat |
| 9 | **Connect 4** | board (grid) | **online multiplayer** |
| 10 | **Uno-like (Shed)** | cards (shedding) | **online multiplayer** |

Every game has auto-rendered settings, a pure reducer (unit-tested), and posts
finishing scores to the leaderboard.

## Architecture at a glance

```
┌────────────────────────────────────────────────────────────────────┐
│  Browser                                                           │
│   │                                                                │
│   │  http://localhost:3050  ───────────────────────────────┐       │
│   ▼                                                        │       │
│  ┌──────────────────────────┐         ┌────────────────────▼────┐  │
│  │  web  (nginx + React)    │ ──/api/ │  server  (Fastify)      │  │
│  │  ghcr.io/.../web:latest  │ ──/ws── │  ghcr.io/.../server:... │  │
│  └──────────────────────────┘         │   + SQLite (volume)     │  │
│          ▲                            │   + WebSocket hub       │  │
│          │ pulls from GHCR            │   + Room registry       │  │
│          │ on `docker compose up`     └─────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

Only the web container is exposed on the host (`3050` by default). The server
stays internal to the compose network; nginx reverse-proxies `/api/*` and `/ws`
to it. Multiplayer games ship a single reducer in `shared/` that both client
and server import — no logic drift possible.

## Quick start

```bash
cp .env.example .env             # then fill in JWT_SECRET (openssl rand -hex 32)
docker compose up -d             # pulls the latest images from GHCR and runs them
curl http://127.0.0.1:3050/api/health
# then open http://127.0.0.1:3050/
```

That's it. The whole stack runs on one port (`3050` by default).

### Pull-only by design

`docker-compose.yml` has **no `build:` sections**. Every `docker compose up`
pulls the latest prebuilt images from GitHub Container Registry:

- `ghcr.io/atvriders/cards-and-such-server:latest`
- `ghcr.io/atvriders/cards-and-such-web:latest`

Both are public — no login needed. To pin to a specific commit, set
`IMAGE_TAG=sha-<short>` in `.env`.

### Building locally (contributor workflow)

Only if you're changing `server/` or `web/` source and want to test against
your own build instead of GHCR:

```bash
docker compose -f docker-compose.yml -f docker-compose.ci.yml up -d --build
```

## Configuration

Everything deploy-dependent is driven by `.env` (see [.env.example](.env.example)):

| Variable | Default | Purpose |
|---|---|---|
| `JWT_SECRET` | *(dev-only fallback — insecure)* | HS256 signing secret. ≥ 16 chars. **Always set for anything past localhost.** |
| `CORS_ORIGIN` | `http://localhost:3050` | Browser origin the server trusts. Must match the URL users actually open. |
| `WEB_PORT` | `3050` | Host port for the SPA + API proxy. |
| `IMAGE_TAG` | `latest` | GHCR tag to pull. |

## Development

Install dependencies, then run any combination of:

```bash
npm install
npm run typecheck                # all workspaces
npm run test                     # unit tests (shared + server + web)
npm -w @cards/shared run test    # just the shared schemas
npm -w @cards/server run test    # backend (Fastify + SQLite + WS)
npm -w @cards/web run test       # frontend (Vitest + jsdom)
npm -w @cards/e2e run test       # Playwright — requires compose stack running
```

Source hot-reload while developing the UI against a local compose stack:

```bash
docker compose up -d             # stack on :3050
npm -w @cards/web run dev        # Vite dev server on :5173, proxies /api and /ws to server
```

## Repo layout

```
cards-and-such/
├── shared/       @cards/shared — zod schemas + TS types + multiplayer reducers
├── server/       @cards/server — Fastify + SQLite + WebSocket rooms
├── web/          @cards/web    — React 18 + Vite + Zustand (+ the 10 games)
├── e2e/          @cards/e2e    — Playwright smoke + multiplayer tests
├── docker-compose.yml         pull-only compose (user-facing)
├── docker-compose.ci.yml      CI override that adds local build capability
├── .env.example
└── docs/
    ├── superpowers/            spec + plans
    ├── game-catalog.md         1,188 games (Phase 2+ backlog)
    └── game-catalog-extended.md  1,285 more (regional/obscure/tabletop)
```

## CI

- **CI** — typecheck + unit tests on every branch; e2e (Playwright via docker compose) gated on unit.
- **Publish images** — on push to `master`, builds & pushes server + web images to GHCR with `latest` and `sha-<short>` tags.

Both workflows run on GitHub-hosted `ubuntu-latest`. No external secrets beyond the default `GITHUB_TOKEN`.

## Roadmap

Phase 1 ships the platform. The 2,400-game backlog in `docs/game-catalog*.md`
feeds the next iteration. Short-term focus (from the final code review):

- Persist current-game in presence so "Online Now" shows which game each user is in.
- Room-session reconnect with backoff (currently only the lobby channel reconnects).
- Quick-match queue for Uno-like (auto-countdown, auto-start at min players).
- Richer e2e coverage: special-card effects in Uno-like, win-detection paths in Checkers.

## License

MIT — see [LICENSE](LICENSE).

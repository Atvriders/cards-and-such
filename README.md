# cards-and-such

Browser-based game hub for card, dice, board, and arcade games. See
`docs/superpowers/specs/2026-04-20-cards-and-such-phase-1-design.md` for
the full Phase 1 design.

## Status

- **Plan A — Platform Foundation:** complete
- **Plan B — Single-Player Games:** complete (8 games: Klondike, FreeCell, Blackjack, Video Poker, Yahtzee, Farkle, Tic-Tac-Toe, Checkers)
- **Plan C — Multiplayer + Polish:** complete (Connect 4 online, Uno-like online)

## Games

10 launch games across single-player and online multiplayer:

1. **Klondike Solitaire** — classic 7-column solitaire
2. **FreeCell** — all cards face-up solitaire variant
3. **Blackjack** — single-player vs. dealer
4. **Video Poker** — Jacks-or-Better draw poker
5. **Yahtzee** — 5-dice scoring game
6. **Farkle** — press-your-luck dice game
7. **Tic-Tac-Toe** — 3×3 grid, vs. minimax AI
8. **Checkers** — 8×8 board, vs. minimax AI
9. **Connect 4** — 7×6 online multiplayer
10. **Uno-like (Shed)** — shedding card game, online multiplayer

## Local development

```bash
npm install
cp .env.example .env             # then fill in JWT_SECRET (openssl rand -hex 32)
docker compose up -d             # pulls pre-built images from GHCR; brings up web (:8080) + server (:4000)
docker compose up -d --build     # rebuild images locally instead of pulling
curl http://127.0.0.1:8080/api/health
# then open http://127.0.0.1:8080/
```

Every deploy-dependent value (secret, CORS origin, ports, image tag) is
configured via `.env`. See [.env.example](.env.example) for the full list.

To run tests:

```bash
npm run typecheck
npm run test                     # unit tests for all workspaces
npm -w @cards/e2e run test       # requires docker compose to be up
```

## Packages

- `shared/` — zod schemas + TS types shared by client and server.
- `server/` — Fastify + SQLite + WebSocket server.
- `web/` — React + Vite UI.
- `e2e/` — Playwright end-to-end tests.

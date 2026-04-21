# cards-and-such

Browser-based game hub for card, dice, board, and arcade games. See
`docs/superpowers/specs/2026-04-20-cards-and-such-phase-1-design.md` for
the full Phase 1 design.

## Status

- **Plan A — Platform Foundation:** in progress
- **Plan B — Single-Player Games:** not started
- **Plan C — Multiplayer + Polish:** not started

## Local development

```bash
npm install
docker compose up -d --build     # brings up web (:8080) + server (:4000)
curl http://127.0.0.1:8080/api/health
# then open http://127.0.0.1:8080/
```

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

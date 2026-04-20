# cards-and-such — Phase 1 Design

**Date:** 2026-04-20
**Status:** Spec (pending user review)
**Scope:** Phase 1 only. Phase 2+ (remaining ~1000 games in the catalog) is out of scope here.

---

## 1. Goal

A browser-based game hub for card, dice, board, and arcade games. Phase 1 delivers the platform (site shell, plugin architecture, username-only accounts, shared leaderboard, live-presence, realtime multiplayer) and 10 launch games across 5 game families, with 2 of those games playable against other live users.

The catalog of 1000+ games (produced separately at `docs/game-catalog.md`) becomes the Phase 2+ backlog.

## 2. Non-goals for Phase 1

Explicitly out of scope; these are deferrable without structural rework:

- The remaining 990+ games in the catalog
- Passwords, email, OAuth, password recovery (username-only is final for Phase 1)
- Friends, chat, direct messages, profiles with avatars
- Mobile-native clients (web is responsive; no React Native)
- Ads, monetization, in-app purchases
- Tournaments, brackets, seasonal ladders (beyond per-game Elo)
- Spectator mode, replays, game history beyond score rows
- Internationalization (English only)

## 3. Repository layout

```
/home/kasm-user/cards-and-such/
├── web/                      # React 18 + TS strict + Vite + Zustand
│   ├── src/
│   │   ├── games/            # one subdir per game plugin
│   │   ├── engines/          # shared engines: tableau, dice, grid, deck
│   │   ├── platform/         # shell, router, lobby, leaderboard, auth
│   │   └── net/              # WebSocket client + RPC typed helpers
│   └── index.html
├── server/                   # Node 20 + Fastify + better-sqlite3 + ws
│   ├── src/
│   │   ├── http/             # REST: /auth/claim, /leaderboard, /games
│   │   ├── ws/               # lobby channel, room channels, presence
│   │   ├── games/            # authoritative reducers (shared with web/)
│   │   └── db/               # migrations + query helpers
│   └── data/                 # sqlite file lives here (volume-mounted)
├── shared/                   # TS types + zod schemas (RPC contract)
├── docs/
│   ├── game-catalog.md       # 1000+ game backlog
│   └── superpowers/
│       ├── specs/
│       └── plans/
├── docker-compose.yml        # web + server + data volume
└── README.md
```

`shared/` is imported by both `web/` and `server/` so RPC shapes and game reducers cannot drift.

## 4. Tech stack

- **Frontend:** React 18, TypeScript (strict), Vite 5, Zustand, plain CSS per component (matches `windows-in-browser` conventions so context switching is low).
- **Backend:** Node 20, Fastify 4, `better-sqlite3`, `ws` for WebSockets, `zod` for runtime validation at every boundary, `jose` for JWTs.
- **Testing:** Vitest (unit — every reducer), Playwright (end-to-end on the two multiplayer games).
- **Build/deploy:** Docker + docker-compose for dev. Production is "run these two containers behind a reverse proxy"; the choice of host is deferred.

## 5. Core abstraction: the game plugin

Every game is self-contained under `web/src/games/<id>/` and exports a `GamePlugin`:

```ts
interface GamePlugin<S = unknown, A = unknown, Settings = unknown> {
  id: string;                     // url-safe, e.g. "klondike"
  title: string;                  // display name
  category: GameCategory;
  players: { min: number; max: number; multiplayer: boolean };

  settings: SettingSchema<Settings>;   // drives the auto-rendered Options screen
  defaultSettings: Settings;

  component: React.FC<GameProps<S, Settings>>;

  // Multiplayer games only — the server imports these from shared/
  initialState?: (seed: number, settings: Settings) => S;
  reducer?: (state: S, action: A, seat: Seat) => S;
  isTerminal?: (state: S) => { winner: Seat | 'draw' } | null;
}
```

A single `registry.ts` collects every plugin. Adding a new game is a drop-in:

1. Create `web/src/games/<id>/index.ts` exporting the plugin.
2. Add one line to the registry.
3. If multiplayer, re-export `initialState` + `reducer` from `shared/games/<id>/`.

### Shared engines (where the leverage comes from)

Launch games cluster into five families; each family shares a reusable engine under `web/src/engines/`:

| Engine | Provides | Consumed by |
|---|---|---|
| `tableau` | Piles, stacks, drag-drop rules, auto-move, undo history | Klondike, FreeCell |
| `deck` | 52-card deck, shuffle (seeded), deal, standard hand ranking | Blackjack, Video Poker |
| `dice` | N-dice roller (seeded), keep/reroll state, category scoring primitives | Yahtzee-style, Farkle |
| `grid` | MxN grid, turn order, win-condition helpers, minimax-lite bot | Tic-Tac-Toe, Connect 4, Checkers |
| `shedding` | Hand + draw/discard pile, turn order, special-card hooks | Uno-like |

A second game in the same family should land in a day or two, not a week.

## 6. Multiplayer model

Authoritative server. Never trust client state for multiplayer games.

**Flow (Connect 4 or Uno-like):**

1. Client calls `POST /rooms` (or joins by code) → server returns `{ roomId, seat }`.
2. Client opens a WebSocket to `/ws`, subscribes to `room:<roomId>`.
3. Server seeds `initialState` with `(seed, settings)` when the room hits the required player count; broadcasts initial state.
4. Client dispatches actions via `{type: "action", roomId, action}`. Server runs `reducer(state, action, seat)`, validates legality, updates state, broadcasts `{type: "state", state}`.
5. On `isTerminal`, server writes a `scores` row (and updates `ratings` for Elo), broadcasts `{type: "terminal", result}`, closes the room after a short grace window.

**Matchmaking (Phase 1 — intentionally simple):**
- **Quick match:** one open room per game; first N players to arrive auto-start.
- **Private room:** client creates a room, server returns a 4-char code; friends enter the code to join.
- No skill-based matching, no queues.

**Single-player games** never open a room. They post finished-game scores via `POST /scores` with a JWT.

## 7. Auth (username-only)

- `POST /auth/claim { username }` → if username is free, creates the `users` row and returns a signed JWT (HS256, 30-day expiry, `sub = username`). If taken, 409.
- `POST /auth/resume { username }` → reissues a JWT for an existing username. This is deliberately trust-on-first-use; the design accepts that a stranger can "take" someone else's username if they learn it, and documents that tradeoff as acceptable for a casual hub with no sensitive data.
- JWT is stored in `localStorage`; attached as `Authorization: Bearer <token>` to REST calls, and sent as the first WebSocket message for auth.

Rate limits: 20 claims per IP per hour, 60 resumes per IP per hour. Enough to deter casual abuse without being a real anti-abuse layer.

## 8. Presence: "Online Now"

- A single in-memory `Map<username, Connection>` on the server. First WebSocket auth adds; socket close removes.
- The lobby channel broadcasts `{type: "presence", online: number, users: [{username, game}]}` on any add/remove (debounced to once per 500 ms to avoid spam).
- Any client subscribed to `lobby` receives presence updates. The Leaderboard tab subscribes while open.

Process restart wipes presence (in-memory only). Acceptable — reconnects repopulate within seconds.

## 9. Leaderboard

Three views, all reachable from a single `/leaderboard` route with tabs:

1. **Per-game top scores** — select a game, see top 100 by `score` (descending). Filtered by `settings_hash` so Klondike-with-Vegas-scoring and Klondike-with-standard-scoring don't mix.
2. **Global** — total games played per user (top 100). Simple `COUNT(*) GROUP BY username`.
3. **Online Now** — live list from the presence map. Shows count + scrollable list `<username> — <current game or "in lobby">`.

### Storage (SQLite)

```sql
CREATE TABLE users (
  username      TEXT PRIMARY KEY,
  created_at    INTEGER NOT NULL
);

CREATE TABLE scores (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id       TEXT NOT NULL,
  username      TEXT NOT NULL REFERENCES users(username),
  score         INTEGER NOT NULL,
  settings_hash TEXT NOT NULL,
  played_at     INTEGER NOT NULL
);
CREATE INDEX scores_by_game ON scores(game_id, settings_hash, score DESC);
CREATE INDEX scores_by_user ON scores(username);

CREATE TABLE ratings (
  game_id       TEXT NOT NULL,
  username      TEXT NOT NULL REFERENCES users(username),
  elo           INTEGER NOT NULL DEFAULT 1000,
  games_played  INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (game_id, username)
);
```

Elo: K=32, standard formula, only updated on terminal state of a multiplayer game.

## 10. Launch games (Phase 1)

| # | Game | Family / Engine | Multiplayer | Notes |
|---|---|---|---|---|
| 1 | Klondike Solitaire | tableau | no | Classic draw-1 and draw-3; standard + Vegas scoring as settings |
| 2 | FreeCell | tableau | no | 8 cascades, 4 free cells, 4 foundations |
| 3 | Blackjack | deck | no | Single-player vs dealer; configurable deck count and soft-17 rule |
| 4 | Video Poker | deck | no | Jacks-or-Better paytable; 5-card draw |
| 5 | Yahtzee-style | dice | no | 5 dice, 3 rolls, 13-category scorecard |
| 6 | Farkle | dice | no | 6 dice, standard scoring; first to target score wins |
| 7 | Tic-Tac-Toe | grid | no (v1) | Settings: board size 3–5, win-length 3–5; vs bot or hot-seat |
| 8 | Connect 4 | grid | **yes** | 7×6 default; hot-seat or online |
| 9 | Checkers | grid | no (v1) | American rules; vs bot or hot-seat |
| 10 | Uno-like | shedding | **yes** | 2–4 players; generic rules, no trademarked names |

All games expose a Settings screen generated from `settings: SettingSchema`. Settings that affect scoring (deck count, scoring variant, board size) contribute to `settings_hash` so leaderboards stay apples-to-apples.

## 11. Page/route map

- `/` — lobby. Grid of games grouped by category. Search/filter.
- `/play/:gameId` — game screen. Settings panel accessible; single-player or "Play online" button if multiplayer.
- `/leaderboard` — three-tab view (per-game · global · online-now).
- `/login` — username claim/resume.
- `/about` — short text page.

## 12. Error handling

- **Client side:** RPC errors surface as toasts; network loss in a multiplayer game shows "Reconnecting…" and tries up to 30 s before forfeiting the match.
- **Server side:** every REST handler validates input with zod; WebSocket messages are zod-parsed before dispatch. Invalid messages close the socket with a 1008 policy-violation. Reducer invariants enforced server-side; illegal action responds with `{type: "error", reason}` and does not mutate state.

## 13. Testing strategy

- **Vitest unit tests:** one file per reducer, covering the legal-action space, terminal conditions, and at least one representative illegal-action case. Shared engines get their own test suites.
- **Playwright end-to-end:**
  - `connect-4.spec.ts` — two browser contexts, create private room, play a full game, verify terminal state broadcast to both.
  - `uno-like.spec.ts` — three browser contexts, verify turn enforcement and special-card effects.
- **CI:** GitHub Actions runs `tsc -b --noEmit`, Vitest, and Playwright on every push. Builds fail on TypeScript errors or test failures.

## 14. Success criteria (what "Phase 1 done" means)

- All 10 games playable end-to-end.
- Two multiplayer games playable between two independent browser windows.
- Username-only login works; leaderboard shows per-game scores and global totals.
- "Online Now" reflects connected users in under 2 s.
- All Vitest and Playwright tests pass in CI.
- `docker-compose up` starts the full stack from a clean checkout.

## 15. Rough implementation sequence

High-level only; the detailed plan is produced by the writing-plans skill after this spec is approved.

1. Repo scaffold (web + server + shared + docker-compose) and CI.
2. Backend: auth, JWT, WebSocket, presence, leaderboard read/write APIs.
3. Frontend: shell, router, lobby, login, leaderboard tab (including Online Now).
4. Shared engines: `deck`, `tableau`, `dice`, `grid`, `shedding`.
5. Single-player games — Klondike, FreeCell, Blackjack, Video Poker, Yahtzee-style, Farkle, Tic-Tac-Toe, Checkers. These can be implemented in parallel by separate agents once their engines exist.
6. Multiplayer: Connect 4 (simpler, proves the stack) then Uno-like.
7. Polish, Playwright coverage, production docker config.

## 16. Visual direction (non-negotiable Phase 1 requirement)

The site must look **modern and polished** — not a generic "card-game template" look. Concrete requirements that flow into the frontend-design pass:

- **Distinct, considered aesthetic.** No Bootstrap-default feel. Custom typography pairing, a deliberate colour system (dark mode primary, light mode secondary), consistent spacing scale.
- **Fluid motion.** Cards animate with spring physics on deal, flip, and move. Dice tumble. Chips slide. Motion is functional, never decorative noise; respects `prefers-reduced-motion`.
- **Responsive across breakpoints.** Desktop, tablet, phone. Game surfaces reflow; no zooming-a-desktop-site feel on mobile.
- **Real craft in the game surfaces.** Proper felt/wood textures where appropriate, custom card faces (SVG, not public-domain PNGs), a consistent visual language across families so the site feels like one product, not ten.
- **Instant-feeling UI.** Optimistic updates for single-player moves, skeleton states not spinners, route transitions under 100 ms.
- **Accessible.** WCAG AA contrast, keyboard-playable for all single-player games, focus rings visible, semantic HTML.

The detailed component designs, colour tokens, typography system, and game-surface treatments are produced by the `frontend-design` skill **during implementation**, not here — this section sets the bar, the plan sequences the work.

## 17. Open questions deferred to planning

- Which reverse proxy / host for production.
- Whether to adopt a component library (e.g. Radix primitives for menus/dialogs) or hand-build everything. Leaning Radix primitives + plain CSS for styling, since unstyled primitives give accessibility for free without dictating visual direction.

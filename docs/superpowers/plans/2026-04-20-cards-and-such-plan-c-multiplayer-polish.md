# cards-and-such — Plan C: Multiplayer + Polish

**Goal:** Complete Phase 1 by adding realtime multiplayer (Connect 4 and an Uno-like game), the shared shedding engine, the room/matchmaking system, Playwright e2e coverage for multiplayer, and the polish items surfaced by the Plan A final review.

Prior state: Plan B done. 8 single-player games, full plugin system, 171 unit + 21 server tests passing. Latest commit: 4ba1fdd.

---

## Task 1: Server room system + WebSocket room channels

Add the server-side infrastructure for authoritative multiplayer rooms. A `Room` is a per-game-instance object on the server that holds the current state, the seated players, and routes WebSocket actions through the game's reducer.

**Files:**
- Create: `shared/src/rooms.ts` — `RoomId`, `RoomInfo`, `CreateRoomRequest`, `JoinRoomRequest`, `RoomSnapshot`, WS room messages (`WsRoomActionSchema`, `WsRoomStateSchema`, `WsRoomJoinedSchema`, `WsRoomLeftSchema`). Update `shared/src/ws.ts` to include the new message variants.
- Modify: `shared/src/index.ts` — re-export rooms module.
- Create: `server/src/rooms/types.ts` — server-side `Room<S,A>` interface with reducer reference.
- Create: `server/src/rooms/registry.ts` — `RoomRegistry` holding active rooms keyed by id, with `create(gameId)`, `join(roomId, username)`, `leave(roomId, username)`, `dispatch(roomId, username, action)`, `snapshot(roomId)`.
- Create: `server/src/rooms/game-registry.ts` — `SERVER_GAMES` map from gameId to `{initialState, reducer, isTerminal, minPlayers, maxPlayers}`. Starts empty; Connect 4 and Uno-like plug into it in later tasks.
- Create: `server/src/rooms/routes.ts` — REST endpoints `POST /rooms` (create, requires auth), `GET /rooms/:id` (info).
- Modify: `server/src/ws/server.ts` — route incoming `{type:"room-action"}` messages through `RoomRegistry.dispatch(...)`; handle `{type:"room-join", roomId}` to subscribe; broadcast state updates to room subscribers on change.
- Modify: `server/src/index.ts` — register `registerRoomsRoutes(app)` + wire registry into ws module.

Room codes: 4 uppercase alphanumerics, stored in `RoomRegistry`. Creation returns `{ roomId, code, seat }`. Join by `roomId` or by `code`.

Tests: `server/test/rooms.test.ts` — create room, two users join, first user's action updates state for both, rejects actions from non-members, leave reduces seat count.

Commit: `feat(plan-c-task1): server room system + WS room channels`

---

## Task 2: Client room UI + `useRoom` hook

Add the client-side hook and lobby UI for multiplayer. Games themselves plug into this via a `mode: "local"|"online"` setting.

**Files:**
- Create: `web/src/platform/api/rooms.ts` — REST helpers `createRoom(gameId)`, `joinRoomByCode(code)`.
- Create: `web/src/platform/api/useRoom.ts` — hook. Given `{ roomId, token }`, opens WS (or reuses lobby WS), sends `{type:"room-join", roomId}`, subscribes to `room-state` messages, returns `{ state, seat, peers, dispatch(action), status: "connecting"|"connected"|"closed" }`.
- Create: `web/src/pages/PlayOnlinePage.tsx` + `.css` — route `/play/:gameId/online` renders "Quick match" / "Create private room" / "Join by code" options.
- Create: `web/src/pages/PlayOnlinePage.test.tsx`.
- Modify: `web/src/App.tsx` — register `/play/:gameId/online` route.
- Modify: `web/src/pages/LobbyPage.tsx` — for multiplayer-capable games, add a small "online" badge/link.

Commit: `feat(plan-c-task2): client room hook + online matchmaking page`

---

## Task 3: Shedding engine

**Files:**
- Create: `web/src/engines/shedding/index.ts` — `Hand`, `DiscardPile`, `DrawPile`, seeded deal, `canPlay(card, topOfDiscard, rules)`, generic turn-order helpers.
- Create: `web/src/engines/shedding/Hand.tsx` + `.css` — renders a horizontal hand of cards with click-to-play; face-up for own hand, face-down-with-count for peers.
- Create: `web/src/engines/shedding/index.test.ts`.

This engine is thin — Uno-like is the only consumer in Plan C. Keep it focused on: hand management, top-of-discard matching, turn-order with direction flips.

Commit: `feat(plan-c-task3): shedding engine for Uno-like games`

---

## Task 4: Connect 4 — reducer + single-player component + server registration

Connect 4 uses the `grid` engine (`Grid<"red"|"yellow"|null>`). 7×6 board, column-drop mechanic, 4-in-a-row wins.

**Files:**
- Create: `web/src/games/connect-4/state.ts` — pure reducer `(state, action) => state` with actions `{type:"drop", col:number}`. Single-player supports a bot (minimax depth 4). Multiplayer uses the same reducer server-side.
- Create: `web/src/games/connect-4/Connect4.tsx` + `.css` — UI reads state + dispatch; for online play, reads from `useRoom` and dispatches via its `dispatch`.
- Create: `web/src/games/connect-4/index.ts` — `connect4Plugin` with `players: {min:2, max:2, multiplayer:true}`.
- Create: `web/src/games/connect-4/state.test.ts`.
- Modify: `web/src/games/registry.ts` — push plugin.
- Modify: `server/src/rooms/game-registry.ts` — register Connect 4 (import pure reducer from a shared module so client and server run identical logic).
- Create: `shared/src/games/connect-4.ts` — export `initialState`, `reducer`, `isTerminal` so both sides import from `@cards/shared`.

Score (single-player vs bot): win=100, draw=50, loss=0. Multiplayer score = 1 if won, else 0 (Elo update handled server-side).

Commit: `feat(plan-c-task4): Connect 4 game (single-player + online multiplayer)`

---

## Task 5: Uno-like — reducer + component + server registration

Generic shedding-family game (not trademarked Uno). 108-card deck: 4 colors × (0 + 1–9 twice + skip + reverse + draw-2 twice) + 4 wild + 4 wild-draw-4.

**Files:**
- Create: `shared/src/games/uno-like.ts` — pure state, actions `{type:"play", cardId, wildColor?}`, `{type:"draw"}`, `{type:"declare-uno"}`, `{type:"pass"}`. Rules: match top of discard by color, number, or action; wilds playable anytime; draw-2/4 force next player to draw and skip; skip/reverse as expected.
- Create: `web/src/games/uno-like/{index.ts, state.ts (re-exports from shared), UnoLike.tsx, UnoLike.css, state.test.ts}`.
- Modify: `server/src/rooms/game-registry.ts` — register.
- Modify: `web/src/games/registry.ts` — push plugin.

Plugin: `players: {min:2, max:4, multiplayer:true}`. Quick-match: flex-seat timer per spec section 6 — server side waits 30s after 2nd player joins, extends 5s per join up to max 4.

Bot (single-player vs 3 bots): simple rule-based — play legal card that matches top; prefer action cards; choose most-common color when playing a wild.

Commit: `feat(plan-c-task5): Uno-like shedding game (single-player + online multiplayer)`

---

## Task 6: Playwright e2e for multiplayer

Two e2e tests in `e2e/tests/multiplayer.spec.ts`:

1. **Connect 4 online:** two browser contexts, claim two usernames, one creates a private room, shares the code, the other joins, both play a game to completion, both see the terminal state.
2. **Uno-like online:** three browser contexts, quick-match auto-starts after 30s (test uses a faster timeout via query-param override or server-side test-mode hook), each context plays one legal card, verify turns rotate.

These tests are for CI (docker is required). Do NOT attempt to run locally.

Commit: `feat(plan-c-task6): playwright e2e for online Connect 4 and Uno-like`

---

## Task 7: Polish items from Plan A final review

Address the nits flagged at Plan A completion:

1. `web/src/pages/LoginPage.tsx` — replace render-time `setTimeout(() => navigate("/"), 0)` with a proper `useEffect`.
2. `web/src/platform/api/ws.ts` — add reconnect-on-close with exponential backoff (cap at 10s, stop after 5 attempts).
3. `web/src/platform/ui/Toast.tsx` + `.css` — top-right toast stack component. `useToast()` exposes `{push(kind, message)}`. Replace `role="alert"` inline errors in LeaderboardPage with toasts. Login page keeps inline errors (form UX).
4. Normalize `tsc` invocations: `shared/package.json` to use `tsc -p tsconfig.json --noEmit` like the other workspaces.
5. Add `web/tsconfig.test.json` for test-file type coverage (`include: ["test/**/*"]`, `types: ["vitest/globals", "@testing-library/jest-dom"]`).
6. Validate `?settingsHash` query param with zod in `server/src/leaderboard/routes.ts`.
7. `web/src/pages/LeaderboardPage.tsx` — fix `act()` warnings by using `AbortController` + awaiting state updates.

Commit each cluster as its own commit under `feat(plan-c-task7): ...` — e.g., one commit for toasts, one for reconnect, one for tsconfig normalization.

---

## Task 8: Final full-plan code review (all three plans)

Dispatch a code reviewer looking at the complete Phase 1 implementation (Plans A + B + C). Fix any blockers it surfaces. Update the README "Status" section to mark all three plans complete.

---

## Plan C completion checklist

- [ ] All unit + server tests pass
- [ ] `docker compose up -d --build` stack still works (verified via CI)
- [ ] Two users can play Connect 4 online end-to-end
- [ ] 2+ users can play Uno-like online end-to-end
- [ ] Toasts appear for RPC errors on Leaderboard
- [ ] WebSocket reconnects on drop
- [ ] CI is green
- [ ] README status shows all three plans complete

After Plan C, Phase 1 is shipped.

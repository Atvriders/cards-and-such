# cards-and-such — Plan B: Single-Player Games + Game Plugin System

**Goal:** Add the game-plugin system, 4 shared engines (deck, tableau, dice, grid), and 8 single-player games — Klondike, FreeCell, Blackjack, Video Poker, Yahtzee-style, Farkle, Tic-Tac-Toe, Checkers. After Plan B, the lobby shows game tiles, each game has an Options screen and plays end-to-end, and finished games post scores to `/scores` which appear on the leaderboard.

**Architecture:** A registry pattern — `web/src/games/registry.ts` holds a `GamePlugin` for each game; the lobby maps over the registry to render tiles; `/play/:gameId` looks up the plugin and renders its component. Game logic lives in pure reducers (`initialState` + `reducer(state, action) → state`) so it can be unit-tested without the DOM and later reused server-side for multiplayer (Plan C).

**Reference spec:** `docs/superpowers/specs/2026-04-20-cards-and-such-phase-1-design.md` section 5, 10.

Prior state: Plan A complete (commit 8bcb5dc). 41 unit tests passing.

---

## Conventions

- All games live under `web/src/games/<id>/` with:
  - `index.ts` exporting the `GamePlugin`
  - `state.ts` exporting `initialState`, `reducer`, `isTerminal`, and any helpers
  - `<Game>.tsx` + `<Game>.css` for the React component
  - `state.test.ts` with reducer tests (legal moves, terminal, at least one illegal-move case)
- Settings schemas use a runtime object (declared in `web/src/platform/game-plugin/settings.ts`) that auto-renders as a form.
- Seeded RNG: every engine takes a `seed: number` and produces deterministic output. Use a simple mulberry32 implementation.
- All reducers are pure — no DOM access, no `Date.now()`, no `Math.random()`.

---

## Task 1: Game plugin system + registry + lobby grid + /play route + Options page

**Files:**
- Create: `web/src/platform/game-plugin/types.ts` — `GamePlugin<S,A,Settings>`, `SettingSchema`, `GameProps`, `Seat`.
- Create: `web/src/platform/game-plugin/settings.ts` — renderable setting schema primitive (number, enum, boolean); `SettingsForm` component that auto-renders.
- Create: `web/src/platform/game-plugin/useSeededRng.ts` — mulberry32 hook returning a `rng()` function.
- Create: `web/src/platform/game-plugin/submitScore.ts` — helper that POSTs to `/api/scores` with the stored JWT + a computed settings hash.
- Create: `web/src/games/registry.ts` — `GAMES: GamePlugin[]` (starts empty; later tasks push entries).
- Create: `web/src/pages/LobbyPage.tsx` + `.css` — grid of tiles built from `GAMES`, grouped by category.
- Create: `web/src/pages/PlayPage.tsx` + `.css` — reads `:gameId`, looks up plugin, shows Options + play UI.
- Modify: `web/src/App.tsx` — replace the lobby placeholder with `<LobbyPage />`, add `/play/:gameId` route to `<PlayPage />`.
- Create: `web/test/game-plugin.test.tsx` — registry empty-state test + Options auto-render test.

**Key types:**

```ts
// types.ts
export type Seat = 0 | 1 | 2 | 3;

export type SettingField =
  | { kind: "number"; label: string; min: number; max: number; step?: number; default: number }
  | { kind: "enum"; label: string; options: readonly string[]; default: string }
  | { kind: "boolean"; label: string; default: boolean };

export type SettingSchema = Record<string, SettingField>;

export type SettingsOf<S extends SettingSchema> = {
  [K in keyof S]: S[K] extends { kind: "number"; default: number } ? number
    : S[K] extends { kind: "enum"; default: infer D } ? D
    : S[K] extends { kind: "boolean"; default: boolean } ? boolean
    : never;
};

export interface GameProps<State, Settings> {
  state: State;
  settings: Settings;
  dispatch: (action: unknown) => void;
  onGameOver: (score: number) => void;
}

export type GameCategory = "solitaire" | "cards" | "dice" | "board";

export interface GamePlugin<State = unknown, Action = unknown, Schema extends SettingSchema = SettingSchema> {
  id: string;
  title: string;
  category: GameCategory;
  players: { min: number; max: number; multiplayer: boolean };
  description: string;

  settings: Schema;
  initialState: (seed: number, settings: SettingsOf<Schema>) => State;
  reducer: (state: State, action: Action) => State;
  isTerminal: (state: State) => { score: number } | null;

  component: React.FC<GameProps<State, SettingsOf<Schema>>>;
}
```

**Settings auto-render** (`settings.ts`): a `<SettingsForm schema={...} values={...} onChange={...} />` component that iterates keys and renders an `<input type="number">`, `<select>`, or `<input type="checkbox">` as appropriate.

**Score submit** (`submitScore.ts`): uses `useAuth.getState().token`; hashes settings with a stable JSON-stringify → sha256 first-8-chars (use the `SubtleCrypto` API; fallback to a simple DJB2 for non-HTTPS dev).

**Lobby & Play routes** — the tests pass if the lobby renders the empty state message when `GAMES.length === 0` and renders tiles when plugins are registered.

Commit: `feat(plan-b-task1): game plugin system + lobby + play route`

---

## Task 2: `deck` engine

**Files:**
- Create: `web/src/engines/deck/index.ts` — `Suit`, `Rank`, `Card` types; `newDeck()`, `shuffle(cards, rng)`, `deal(deck, n)`.
- Create: `web/src/engines/deck/ranking.ts` — `rankHand(hand: Card[])` for poker hands (straight flush → high card).
- Create: `web/src/engines/deck/Card.tsx` + `.css` — renders a single card via SVG (custom face — simple Unicode suits + rank).
- Create: `web/src/engines/deck/index.test.ts` — deterministic shuffle test, deal splits, ranking covers all poker hand classes.

**Card visual:** white-ish rectangle, corner rank+suit in the color matching suit (♥♦ red, ♣♠ black), center suit glyph scaled large. ~60×84 px default; CSS variables for size so games can override.

Commit: `feat(plan-b-task2): deck engine + card rendering`

---

## Task 3: `tableau` engine

**Files:**
- Create: `web/src/engines/tableau/index.ts` — `Pile`, pile kinds (`"tableau"|"foundation"|"stock"|"waste"|"freecell"`), `canMove(pile, cards, targetPile, ruleset)`, `applyMove(piles, move)`.
- Create: `web/src/engines/tableau/Pile.tsx` + `.css` — renders a pile with slight fanning for tableau, stacked for foundation.
- Create: `web/src/engines/tableau/useDragDrop.ts` — hook wrapping HTML5 drag events, exposing `{onDragStart, onDragOver, onDrop}` handlers keyed by pileId.
- Create: `web/src/engines/tableau/index.test.ts` — Klondike-ruleset legality: red-on-black alternation, descending rank; empty tableau accepts any card; foundation by-suit ascending.

The engine is ruleset-parameterised — pass a `canStack(topCard, movingCard)` function. Klondike passes red-on-black descending; FreeCell passes the same plus ≤1-card sequence restriction (cascade size cap handled by game).

Commit: `feat(plan-b-task3): tableau engine with ruleset-based move validation`

---

## Task 4: Klondike Solitaire + FreeCell

Both games use the tableau engine. One agent implements both in parallel directory structure to maximize engine reuse.

**Files:**
- Create: `web/src/games/klondike/{index.ts,state.ts,Klondike.tsx,Klondike.css,state.test.ts}`
- Create: `web/src/games/freecell/{index.ts,state.ts,FreeCell.tsx,FreeCell.css,state.test.ts}`
- Modify: `web/src/games/registry.ts` — push both plugins.

**Klondike:** 7 tableau piles with 1..7 cards (last face-up), stock + waste, 4 foundations. Draw-1 and Draw-3 as setting. Scoring: "Standard" (+10 to foundation, +5 waste-to-tab, +5 tab-flip) or "Vegas" (-52 start, +5 per foundation card). Settings contribute to hash.

**FreeCell:** 8 cascades (6-6-6-6-7-7-7-7 or 8-8-8-8-7-7-7-7, standard is 7-7-7-7-6-6-6-6), 4 free cells, 4 foundations. All cards face-up from start. Standard FreeCell rules.

**Tests per game:** initial layout correctness, a legal move sequence succeeds, an illegal move rejects state, game-over detection.

Commit: `feat(plan-b-task4): Klondike and FreeCell`

---

## Task 5: `dice` engine

**Files:**
- Create: `web/src/engines/dice/index.ts` — `rollDice(n, rng)`, `keepDice(dice, keep)`, category scorers (`scoreStraight`, `scoreThreeOfAKind`, etc.).
- Create: `web/src/engines/dice/Die.tsx` + `.css` — pip renders for faces 1..6; optional tumble animation triggered by a `rolling` prop.
- Create: `web/src/engines/dice/index.test.ts` — determinism, category scorers return correct point values.

Commit: `feat(plan-b-task5): dice engine with category scoring helpers`

---

## Task 6: Yahtzee-style + Farkle

Both use the dice engine.

**Files:**
- Create: `web/src/games/yahtzee/{index.ts,state.ts,Yahtzee.tsx,Yahtzee.css,state.test.ts}`
- Create: `web/src/games/farkle/{index.ts,state.ts,Farkle.tsx,Farkle.css,state.test.ts}`
- Modify: `web/src/games/registry.ts`.

**Yahtzee-style:** 13 rounds, 5 dice per round, up to 3 rolls with keeps, 13 category scorecard (ones..sixes, 3-kind, 4-kind, full house, small straight, large straight, yahtzee, chance). Settings: `strictYahtzeeBonus` boolean. Terminal score = sum of all category cells.

**Farkle:** 6 dice per turn. Player rolls, must set aside ≥1 scoring die (1s, 5s, triples, etc.), then may re-roll remaining. If all 6 score, "hot dice" — re-roll all. Farkle = no scoring dice in a roll → turn ends, lose round. First to target score (setting: 5000, 10000) wins. Single-player here is "hit target in fewest turns" (score = turns-to-target, lower is better).

**Tests:** scoring of every category (Yahtzee), Farkle turn mechanics (scoring set-aside, hot dice, farkle detection).

Commit: `feat(plan-b-task6): Yahtzee and Farkle`

---

## Task 7: `grid` engine

**Files:**
- Create: `web/src/engines/grid/index.ts` — `Grid<T>` (MxN), `Coord`, `neighbors`, `lineThroughContains` (for n-in-a-row detection).
- Create: `web/src/engines/grid/Board.tsx` + `.css` — generic MxN grid renderer taking a `renderCell(coord, value)` prop.
- Create: `web/src/engines/grid/minimax.ts` — `minimax<State>(state, depth, evaluate, children, isMaximizing)` helper; iterative-deepening friendly.
- Create: `web/src/engines/grid/index.test.ts` — `lineThroughContains` for horizontal/vertical/diagonal, minimax on a trivial 2-move game.

Commit: `feat(plan-b-task7): grid engine + minimax helper`

---

## Task 8: Tic-Tac-Toe + Checkers

Both use the grid engine. Tic-Tac-Toe has configurable board size (3×3 to 5×5) and win-length. Checkers is American rules.

**Files:**
- Create: `web/src/games/tic-tac-toe/{index.ts,state.ts,TicTacToe.tsx,TicTacToe.css,state.test.ts}`
- Create: `web/src/games/checkers/{index.ts,state.ts,Checkers.tsx,Checkers.css,state.test.ts}`
- Modify: `web/src/games/registry.ts`.

**Tic-Tac-Toe:** settings `{boardSize: 3|4|5, winLength: 3|4|5, opponent: "bot"|"hot-seat"}`. Bot: minimax for 3x3, heuristic (cells near center > edges) for larger.

**Checkers:** 8×8, 12 pieces per side, moves forward diagonally, mandatory captures (American rules), kinging. Settings `{mandatoryCapture: boolean, flyingKings: boolean, opponent: "bot"|"hot-seat"}`. Bot: alpha-beta minimax depth 4 with piece-count + king-bonus + advancement eval.

**Tests:** legal moves, terminal detection, draws by no-progress in Checkers, win-line detection in TTT.

Score: TTT single-player = win=10/draw=5/loss=0 vs bot (none if hot-seat — score=0). Checkers single-player = pieces-remaining at win (high=better) or 0 on loss.

Commit: `feat(plan-b-task8): Tic-Tac-Toe and Checkers`

---

## Task 9: Blackjack + Video Poker

Both use the deck engine.

**Files:**
- Create: `web/src/games/blackjack/{index.ts,state.ts,Blackjack.tsx,Blackjack.css,state.test.ts}`
- Create: `web/src/games/video-poker/{index.ts,state.ts,VideoPoker.tsx,VideoPoker.css,state.test.ts}`
- Modify: `web/src/games/registry.ts`.

**Blackjack:** 1..8-deck shoe (setting), dealer stands soft-17 (setting: stand/hit), blackjack pays 3:2. Actions: hit, stand, double, split (only first two cards), insurance offered when dealer shows Ace. Player starts with $1000; bet per hand (setting: bet size). Terminal score = final bankroll after configurable hand count (setting: `handsPerSession` default 25).

**Video Poker:** Jacks-or-Better. 5-card draw. Bet credits, hold/discard, deal replacements, evaluate hand. Paytable (setting: "9/6"|"8/5"). Start with 100 credits; game ends when credits = 0 or `handsPlayed = handsPerSession` (setting, default 50). Score = final credit balance.

**Tests:** dealer-busts, blackjack payout, split-pair flow (Blackjack); paytable evaluation, hold+replace correctness (Video Poker).

Commit: `feat(plan-b-task9): Blackjack and Video Poker`

---

## Task 10: Playwright e2e smoke for one game

Extend the existing `e2e/tests/smoke.spec.ts` with a new test that: logs in, opens Tic-Tac-Toe, plays a quick 3x3 win vs the bot, asserts a score row appears on the leaderboard.

**File:**
- Modify: `e2e/tests/smoke.spec.ts` — append a new `test("plays tic-tac-toe and posts a score")`.

Commit: `feat(plan-b-task10): e2e test for tic-tac-toe single-player flow`

---

## Plan B completion checklist

- [ ] All unit tests pass (existing 41 + new)
- [ ] Lobby shows 8 tiles grouped by category (4 solitaire/cards, 2 dice, 2 board)
- [ ] Every game plays end-to-end from Options screen through terminal state
- [ ] Finishing a game posts to `/scores` and appears on per-game leaderboard
- [ ] CI still green

After Plan B is done, **Plan C (Multiplayer + Polish)** is written and executed.

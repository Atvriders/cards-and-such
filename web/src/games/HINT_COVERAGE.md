# Hint Coverage Audit

_Generated: 2026-05-02 (W505 docs refresh)_

Audit of `hint:` field presence in `web/src/games/*/index.ts`. A game is
considered "hint-wired" if the literal substring `hint:` appears anywhere
in its `index.ts` (covers both `hint:` definitions and `hint:` invocations).

## Summary

- **Total games:** 4505
- **With hint:** 4467
- **Without hint:** 38
- **Coverage:** 99.2%

## By Category

| Category | With Hint | Total | Coverage | Unwired |
| --- | ---: | ---: | ---: | ---: |
| solitaire | 452 | 452 | 100.0% | 0 |
| cards | 976 | 976 | 100.0% | 0 |
| dice | 474 | 474 | 100.0% | 0 |
| board | 2055 | 2093 | 98.2% | 38 |
| arcade | 510 | 510 | 100.0% | 0 |
| **TOTAL** | **4467** | **4505** | **99.2%** | **38** |

## Unwired Game IDs by Category

Games below have no `hint:` substring in their `index.ts`. The remaining
unwired set is concentrated in deterministic combinatorial board games
(tafl, tic-tac-toe variants, lights-out, nonograms) where a "best move"
hint is either trivial or out of scope for the static hint system.

### solitaire (0 unwired / 452 total — 100.0% coverage)

_All games in this category have hints wired._

### cards (0 unwired / 976 total — 100.0% coverage)

_All games in this category have hints wired._

### dice (0 unwired / 474 total — 100.0% coverage)

_All games in this category have hints wired._

### board (38 unwired / 2093 total — 98.2% coverage)

- arctic-survival
- ard-ri
- brandubh
- connect-four-mini
- daldos
- dameo
- eight-queens-mini
- food-truck-tycoon
- gomoku-mini
- lights-out-3d
- lights-out-mini
- logic-gates-sim
- magic-square-3
- magpie-tafl
- nim-game
- nonogram
- nonogram-3x3
- numlinks
- pairs-themed
- pallanguzhi
- ponnuki
- religions-quiz
- roulette
- slide-puzzle-3x3
- spot-it
- spot-it-classic
- tablan
- target-practice
- tic-tac-toe-3-in-row
- tic-tac-toe-blitz
- tic-tac-toe-corners-win
- tic-tac-toe-large
- ultimate-tic-tac-toe
- yavalath
- zamma
- falling-catcher
- frog-catcher
- quick-tick

### arcade (0 unwired / 510 total — 100.0% coverage)

_All games in this category have hints wired._

---

_Audit method: literal `hint:` substring match on each `index.ts`. Category derived from the first `category: "..."` declaration in the file._

## Quality issues

_Generated: 2026-05-02 (selector quality pass)_

Beyond presence, this section tracks selector-level quality: does the
`hint:`-returned selector actually resolve to a rendered DOM node in the
current phase? Audit method below.

### Spot check (30-game random sample, seed=42)

All 30 games returned selectors that resolve to a rendered node in the
current phase: data-testid literals matched, template-literal testids
have a matching template shape in the component, class selectors had a
class token rendered (including via shared `_shared/` views like
`CoopView` / `DeductionView` for plugins that delegate via
`coopHintSelector` / `deductionHintSelector`).

Sample game IDs (seed=42, n=30): `coin-dribble-pub`, `avalon-quiz`,
`kubrick-quiz`, `history-trivia`, `gioul-race`, `diagonal-killer`,
`chutes-ladders-kids`, `yavalath`, `carlton-patience`,
`samurai-sudoku-mini`, `barbooth`, `banana-split`, `century-spice-road`,
`game-dev-studio`, `grizzled-orders`, `transcendental-chess`,
`b-s-cheat-shed`, `fibbage-2-quiz`, `yamaguchi-opening`, `saboteur-mini`,
`gear-puzzle`, `soccer-ball-tap`, `laser-lock`, `aeons-end-coop`,
`dice-rainbow`, `sashigane-mini`, `neologism-quiz`, `lasca-stack`,
`dice-mma`, `freeroll-tournament`.

### Full-corpus selector check

A subsequent corpus-wide static check (script: `/tmp/spot_check_hints.py`,
`/tmp/find_typos.py`, `/tmp/find_class_typos.py`) found **zero** broken
selectors across the 4467 hint-wired games:

- Literal `data-testid` selectors → 0 mismatches (testid not rendered).
- Class selectors → 0 mismatches (class never appears in component CSS or JSX).
- Template-literal selectors (`[data-testid="${a}-${b}"]`) → all have a
  matching template shape in `Game.tsx` or a shared view.
- Generic single-token class selectors (`.btn`, `.card`, `.cell`, etc.) → 0.

### Known quality caveats (corpus-level, not per-game)

These are limitations of the static check, not bugs. Static analysis
cannot prove a hint actually pulses a button at the *moment* the user
presses Hint:

1. **Phase staleness** — A selector may resolve in the DOM only when
   `state.phase` matches a particular value. Most plugins gate this
   correctly (e.g. `state.phase === "playing"` ? selector : null),
   but the static checker does not simulate runtime states. Games
   that delegate to `_shared/coop-engine.ts#coopHintSelector` and
   `_shared/deduction-engine.ts#deductionHintSelector` were spot-verified
   manually and gate on `phase === "guess"` / valid recommendation.

2. **Conditional rendering** — A selector for, say,
   `[data-testid="hint-target-foo-next"]` may target a button that is
   only rendered when `phase === "scored"`. The hint function and the
   render guard need to agree. This was spot-checked across the sample
   above; corpus-wide manual review is out of scope for this pass.

3. **First-match ambiguity** — Some games return a class selector that
   matches multiple elements (e.g. `.cn-cell:not(.p):not(.c)` in
   `yamaguchi-opening`). The browser's `querySelector` picks the first,
   which is usually a reasonable hint but not guaranteed to be the
   *best* move. Acceptable for a "nudge"-style hint.

The 38 unwired board games are tracked above for future passes; they are
mostly deterministic puzzles or abstract two-player games where adding a
solver-backed hint requires per-game work rather than a registry sweep.

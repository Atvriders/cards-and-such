# Hint Coverage Audit

_Generated: 2026-05-02 (W526 final report — 100% coverage)_

Audit of `hint:` field presence in `web/src/games/*/index.ts`. A game is
considered "hint-wired" if the literal substring `hint:` appears anywhere
in its `index.ts` (covers both `hint:` definitions and `hint:` invocations).

## Summary

- **Total games:** 4505
- **With hint:** 4505
- **Without hint:** 0
- **Coverage:** 100.0%

## By Category

| Category | With Hint | Total | Coverage | Unwired |
| --- | ---: | ---: | ---: | ---: |
| solitaire | 452 | 452 | 100.0% | 0 |
| cards | 976 | 976 | 100.0% | 0 |
| dice | 474 | 474 | 100.0% | 0 |
| board | 2093 | 2093 | 100.0% | 0 |
| arcade | 510 | 510 | 100.0% | 0 |
| **TOTAL** | **4505** | **4505** | **100.0%** | **0** |

## Unwired Game IDs by Category

_None. Every game across every category has a `hint:` wired in its
`index.ts`._

### solitaire (0 unwired / 452 total — 100.0% coverage)

_All games in this category have hints wired._

### cards (0 unwired / 976 total — 100.0% coverage)

_All games in this category have hints wired._

### dice (0 unwired / 474 total — 100.0% coverage)

_All games in this category have hints wired._

### board (0 unwired / 2093 total — 100.0% coverage)

_All games in this category have hints wired._

### arcade (0 unwired / 510 total — 100.0% coverage)

_All games in this category have hints wired._

---

_Audit method: literal `hint:` substring match on each `index.ts`. Category derived from the first `category: "..."` declaration in the file._

## Selector quality

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

A corpus-wide static check (script: `/tmp/spot_check_hints.py`,
`/tmp/find_typos.py`, `/tmp/find_class_typos.py`) found **zero** broken
selectors across all 4505 hint-wired games:

- Literal `data-testid` selectors → 0 mismatches (testid not rendered).
- Class selectors → 0 mismatches (class never appears in component CSS or JSX).
- Template-literal selectors (`[data-testid="${a}-${b}"]`) → all have a
  matching template shape in `Game.tsx` or a shared view.
- Generic single-token class selectors (`.btn`, `.card`, `.cell`, etc.) → 0.

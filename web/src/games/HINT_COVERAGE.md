# Hint Coverage Audit

_Generated: 2026-05-02 (v2 refresh)_

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

Games below have no `hint:` substring in their `index.ts`.

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

# E2E Suite Status Snapshot

Snapshot date: 2026-05-02
Runner: `cd e2e && npx playwright test --reporter=list`
Browser: chromium

## Headline

- Total tests discovered: **55** across **14 spec files**
- Result without a running dev server: **0 passed / 55 failed / 0 skipped**

All failures are expected: the suite requires the Vite dev server (or a built preview)
to be reachable at the configured baseURL. Without a server up, every test fails at
the initial `page.goto(...)` step. Bring a dev server online (e.g. `npm run dev` from
the repo root) before re-running to get a true pass/fail signal.

## Spec files (all currently failing without a server)

| Spec file | Tests | Coverage area |
|---|---|---|
| `tests/a11y.spec.ts` | 4 | axe-core scans of `/`, `/play/klondike`, `/stats`, `/settings` |
| `tests/category-pages.spec.ts` | 5 | per-category render smoke (solitaire, cards, dice, board, arcade) |
| `tests/hint-pulse-smoke.spec.ts` | 5 | hint-pulse animation across klondike/freecell/texas-holdem/yahtzee/wordle-mini |
| `tests/lobby-flows.spec.ts` | 8 | tile counts, favorites chip, welcome tutorial, footer kbd modal, search, category header, leaderboard, daily, 404 hero |
| `tests/multiplayer.spec.ts` | 2 | Connect 4 win flow, Uno-like turn-taking |
| `tests/onboarding-flows.spec.ts` | 2 | tut-step-1 skip, lobby coachmark |
| `tests/play-flows.spec.ts` | 3 | hint-pulse on klondike, Ctrl+Z undo wiring, fullscreen click |
| `tests/play-shortcuts.spec.ts` | 6 | N reseed, F favorite toast, Shift+F fullscreen, `=`/`Shift+=` seed picker, I session info, T per-game settings |
| `tests/replays.spec.ts` | 3 | empty state, footer link nav, seeded rows + Play link |
| `tests/share-handler.spec.ts` | 2 | friend code redirect, fallback share view |
| `tests/smoke.spec.ts` | 2 | username claim + Online Now, tic-tac-toe hot-seat |
| `tests/theme-flows.spec.ts` | 2 | custom accent var, reset theme link |
| `tests/tile-menu.spec.ts` | 4 | right-click open, fav menu item, ArrowDown+Enter, Escape close |
| `tests/top-games.spec.ts` | 6 | klondike tile, navigation, setup panel, theme picker, daily, leaderboard |

## Passed

None on this run (no dev server available in the snapshot environment).

## Skipped

None — Playwright did not skip any specs; the suite has no `test.skip` gates active.

## Failed

All 55 tests, all due to the absent dev server. Re-run after starting the server to
distinguish real regressions from environmental failures.

## How to re-run

```bash
# from repo root, in one shell:
npm run dev

# in another shell:
cd e2e && npx playwright test --reporter=list
```

# Undo Support: Platform vs Reducer-Level

This codebase supports two distinct undo mechanisms. Most games rely on
the platform-level mechanism; reducer-level undo exists only for the rare
cases where the platform mechanism cannot give correct results.

## Platform-Level Undo (default)

Implemented in `web/src/pages/PlayPage.tsx` (`UNDO_STACK_CAP`, `undo`,
`redo`).

- Before each action is dispatched, `PlayPage` snapshots the prior `state`
  reference and pushes `{ state, action }` onto a ring buffer capped at
  `UNDO_STACK_CAP` (20 frames).
- The Undo button (and `Ctrl/Cmd+Z`) pops the most recent frame and sets
  `state` back to the snapshot. The current state is pushed onto a redo
  buffer so `Ctrl/Cmd+Shift+Z` / `Ctrl/Cmd+Y` can step forward again.
- No reducer call is involved on undo: it is purely a presentation-side
  state restore.
- No-op dispatches (reducer returned the same reference) are not pushed,
  so undo never "stutters."
- Any fresh dispatch clears the redo buffer so the timeline doesn't
  branch.

**Why this works for ~all games**

Almost every reducer in this repo is pure: a function of `(state,
action)` returning a new state, with all entropy (RNG seed, deck order,
turn counter, etc.) carried inside `state` itself. Because undo restores
the *exact prior state*, it does not need to re-run any randomness — the
prior dice / shuffle / pick are gone, and the next user action runs from
the restored state as if the undone action never happened.

## Reducer-Level Undo (rare)

A reducer-level approach keeps `history: State[]` inside the state itself
(see `web/src/platform/game-plugin/undoHistory.ts` for the shared
`pushHistory` / `popHistory` helpers) and handles an explicit
`{ type: "undo" }` action that pops the most recent snapshot.

This is only worth adding when **the platform-level mechanism cannot
faithfully roll back**, which boils down to a reducer that produces
externally-visible side effects beyond returning a new state. Concretely:

- The reducer writes to `localStorage`, `sessionStorage`, or any other
  global outside of `state`.
- The reducer issues network requests, navigation, or other I/O whose
  effects cannot be reversed by simply restoring a prior state object.
- The game design needs undo to traverse semantic checkpoints rather
  than single dispatches (e.g., "undo the whole turn"). Even then,
  reducer-level undo is one way to model this; another is to dispatch
  a single coarse-grained action and rely on platform undo.

Reducers in this repo today are pure: a sample of representative games
shows no `localStorage`, `fetch`, or other side effects inside reducers.
`Math.random()` / `Date.now()` calls that *do* exist (e.g., for AI
opponent decisions, restart-with-new-seed, unique IDs) all flow into the
returned state, so platform undo still works correctly — restoring the
prior state simply discards those values.

## Guidance for New Games

1. Start with the platform mechanism — do nothing special; you get undo
   and redo for free as long as your reducer is pure.
2. Only reach for reducer-level undo if your reducer has an
   unreversible side effect, or your game's undo semantics demand
   multi-step rollback.
3. If you add reducer-level undo, use the shared `pushHistory` /
   `popHistory` helpers in `web/src/platform/game-plugin/undoHistory.ts`
   so the history shape is consistent across games. Keep `history: []`
   in `initialState` and snapshot only on actions whose effect on state
   you want individually undoable.

## Notes on the current Klondike state

`web/src/games/klondike/state.ts` declares `{ type: "undo" }` in its
action union and imports `pushHistory` / `popHistory`, but the reducer
does not actually handle the action or push history frames. With the
platform-level undo in place this is dormant rather than broken — undo
still works via `PlayPage`. The dangling import and action variant could
be cleaned up the next time the file is touched, but no functional bug.

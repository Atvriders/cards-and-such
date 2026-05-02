/**
 * Undo-history helper.
 *
 * History is stored as snapshots of prior states with their own `history`
 * cleared, capped at the last 10 snapshots. Snapshots are pushed by the
 * reducer immediately before mutating state for an action that should be
 * undoable.
 */
export const UNDO_LIMIT = 10;

/**
 * Push the current state onto an existing history array, capped at UNDO_LIMIT.
 * Snapshots are stored with `history` set to an empty array so we never store
 * history-of-history.
 */
export function pushHistory<S extends { history: S[] }>(state: S): S[] {
  const snapshot = { ...state, history: [] as S[] };
  const next = [...state.history, snapshot];
  if (next.length > UNDO_LIMIT) next.splice(0, next.length - UNDO_LIMIT);
  return next;
}

/**
 * Pop the most recent snapshot. If history is empty, return null and the
 * caller should leave state unchanged.
 *
 * The popped snapshot becomes the new state and its history is set to the
 * remaining history list (so it inherits the rest of the chain).
 */
export function popHistory<S extends { history: S[] }>(state: S): S | null {
  if (state.history.length === 0) return null;
  const last = state.history[state.history.length - 1]!;
  const remaining = state.history.slice(0, -1);
  return { ...last, history: remaining } as S;
}

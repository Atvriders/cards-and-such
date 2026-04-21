export interface MinimaxOpts<State, Move> {
  /** Possible moves from this state. */
  moves(state: State): Move[];
  /** Apply a move, returning the new state. */
  apply(state: State, move: Move): State;
  /** True if state is terminal (no further moves). */
  isTerminal(state: State): boolean;
  /** Static evaluation from the perspective of the maximizing player. */
  evaluate(state: State): number;
  /** Maximum search depth. */
  depth: number;
  /** True if it is currently the maximizing player's turn. */
  maximizing(state: State): boolean;
}

export interface MinimaxResult<Move> {
  move: Move | null;
  score: number;
  nodesExplored: number;
}

export function minimax<S, M>(state: S, opts: MinimaxOpts<S, M>): MinimaxResult<M> {
  let nodes = 0;
  function rec(s: S, depth: number, alpha: number, beta: number): { score: number; move: M | null } {
    nodes++;
    if (depth === 0 || opts.isTerminal(s)) {
      return { score: opts.evaluate(s), move: null };
    }
    const moves = opts.moves(s);
    if (moves.length === 0) return { score: opts.evaluate(s), move: null };
    const maxPlayer = opts.maximizing(s);
    let bestMove: M | null = null;
    let bestScore = maxPlayer ? -Infinity : Infinity;
    for (const m of moves) {
      const next = opts.apply(s, m);
      const { score } = rec(next, depth - 1, alpha, beta);
      if (maxPlayer) {
        if (score > bestScore) { bestScore = score; bestMove = m; }
        alpha = Math.max(alpha, bestScore);
      } else {
        if (score < bestScore) { bestScore = score; bestMove = m; }
        beta = Math.min(beta, bestScore);
      }
      if (beta <= alpha) break;
    }
    return { score: bestScore, move: bestMove };
  }
  const { score, move } = rec(state, opts.depth, -Infinity, Infinity);
  return { score, move, nodesExplored: nodes };
}

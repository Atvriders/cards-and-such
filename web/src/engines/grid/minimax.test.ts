import { describe, expect, it } from "vitest";
import { minimax, type MinimaxOpts } from "./minimax.js";

/**
 * Trivial game: current state is a number, moves subtract 1, 2, or 3,
 * terminal at 0. Evaluate = 1 if maximizer just moved to 0, else -1.
 * Classic nim/subtraction game — maximizer always wins from non-multiples of 4 with depth.
 */

describe("minimax alpha-beta", () => {
  type S = { n: number; maxTurn: boolean };
  type M = 1 | 2 | 3;
  const opts: MinimaxOpts<S, M> = {
    moves: (s) => (s.n > 0 ? ([1, 2, 3] as M[]).filter((m) => s.n - m >= 0) : []),
    apply: (s, m) => ({ n: s.n - m, maxTurn: !s.maxTurn }),
    isTerminal: (s) => s.n === 0,
    evaluate: (s) => (s.n === 0 ? (s.maxTurn ? -1 : 1) : 0),
    depth: 6,
    maximizing: (s) => s.maxTurn,
  };

  it("finds a winning move when one exists", () => {
    const res = minimax({ n: 5, maxTurn: true }, opts);
    // From n=5 with maxTurn, best move is 1 (leaving n=4 for opponent, losing position).
    expect(res.move).toBe(1);
    expect(res.nodesExplored).toBeGreaterThan(0);
  });

  it("returns move=null at terminal", () => {
    const res = minimax({ n: 0, maxTurn: true }, opts);
    expect(res.move).toBeNull();
  });
});

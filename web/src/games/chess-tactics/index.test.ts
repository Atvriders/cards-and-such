import { describe, it, expect } from "vitest";
import { chessTacticsPlugin } from "./index.js";
import type { PuzzleState } from "./state.js";

const S = {} as never;

describe("chess-tactics plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(chessTacticsPlugin.id).toBe("chess-tactics");
    expect(chessTacticsPlugin.title).toBe("Chess Tactics");
    expect(chessTacticsPlugin.category).toBe("board");
    expect(chessTacticsPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof chessTacticsPlugin.description).toBe("string");
    expect(chessTacticsPlugin.description.length).toBeGreaterThan(0);
    expect(chessTacticsPlugin.settings).toBeDefined();
    expect(typeof chessTacticsPlugin.settings).toBe("object");
    expect(typeof chessTacticsPlugin.initialState).toBe("function");
    expect(typeof chessTacticsPlugin.reducer).toBe("function");
    expect(typeof chessTacticsPlugin.isTerminal).toBe("function");
    expect(chessTacticsPlugin.component).toBeDefined();
  });

  it("initialState is deterministic and isTerminal is null on fresh start", () => {
    const a = chessTacticsPlugin.initialState(7, S) as PuzzleState;
    const b = chessTacticsPlugin.initialState(7, S) as PuzzleState;
    expect(a.puzzleIndex).toBe(0);
    expect(a.status).toBe("playing");
    expect(a.selected).toBeNull();
    expect(a.board.length).toBe(b.board.length);
    expect(a.puzzle.fen).toBe(b.puzzle.fen);
    expect(a.message).toBe(b.message);
    expect(chessTacticsPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on a fresh state and null when complete", () => {
    expect(typeof chessTacticsPlugin.hint).toBe("function");
    const fresh = chessTacticsPlugin.initialState(1, S) as PuzzleState;
    const result = chessTacticsPlugin.hint!(fresh);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe(".cp-btn");
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // When the puzzle is flagged complete, hint should yield null.
    // Hint code checks `complete`/`isComplete` flags, not the `status` field.
    const flaggedDone = { ...fresh, complete: true } as unknown as PuzzleState;
    expect(chessTacticsPlugin.hint!(flaggedDone)).toBeNull();

    // isTerminal keys off the `status` field on PuzzleState.
    const statusComplete: PuzzleState = { ...fresh, status: "complete" };
    expect(chessTacticsPlugin.isTerminal(statusComplete)).toEqual({ score: 1 });
  });
});

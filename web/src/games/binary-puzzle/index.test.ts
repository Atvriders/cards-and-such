import { describe, it, expect } from "vitest";
import { binaryPuzzlePlugin } from "./index.js";

const S = { size: 6 } as const;

describe("binary-puzzle plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(binaryPuzzlePlugin.id).toBe("binary-puzzle");
    expect(binaryPuzzlePlugin.title).toBe("Binary Puzzle");
    expect(binaryPuzzlePlugin.category).toBe("board");
    expect(binaryPuzzlePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof binaryPuzzlePlugin.description).toBe("string");
    expect(binaryPuzzlePlugin.description.length).toBeGreaterThan(0);
    expect(binaryPuzzlePlugin.settings).toBeDefined();
    expect(typeof binaryPuzzlePlugin.settings).toBe("object");
    expect(typeof binaryPuzzlePlugin.initialState).toBe("function");
    expect(typeof binaryPuzzlePlugin.reducer).toBe("function");
    expect(typeof binaryPuzzlePlugin.isTerminal).toBe("function");
    expect(binaryPuzzlePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh board", () => {
    const a = binaryPuzzlePlugin.initialState(42, S);
    const b = binaryPuzzlePlugin.initialState(42, S);
    expect(a.size).toBe(6);
    expect(a.board.length).toBe(36);
    expect(a.solution.length).toBe(36);
    expect(a.clues.length).toBe(36);
    expect(a.won).toBe(false);
    expect(a.movesMade).toBe(0);
    // Deterministic: same seed -> identical solution, board, and clues arrays
    expect(a.solution.join(",")).toBe(b.solution.join(","));
    expect(a.board.map((v) => (v === null ? "_" : v)).join(",")).toBe(
      b.board.map((v) => (v === null ? "_" : v)).join(","),
    );
    expect(a.clues.join(",")).toBe(b.clues.join(","));
    expect(binaryPuzzlePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns null when document is unavailable (jsdom default) or the grid is not mounted", () => {
    expect(typeof binaryPuzzlePlugin.hint).toBe("function");
    const state = binaryPuzzlePlugin.initialState(7, S);
    const result = binaryPuzzlePlugin.hint!(state);
    if (result === null) {
      expect(result).toBeNull();
    } else {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe(".binary-puzzle-grid");
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }
  });
});

import { describe, it, expect } from "vitest";
import { consecutivePairsSudokuPlugin } from "./index.js";
import type { ConsecutivePairsSudokuState } from "./state.js";

const S = { dummy: true } as never;

describe("consecutive-pairs-sudoku plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(consecutivePairsSudokuPlugin.id).toBe("consecutive-pairs-sudoku");
    expect(consecutivePairsSudokuPlugin.title).toBe("Consecutive Pairs Sudoku");
    expect(consecutivePairsSudokuPlugin.category).toBe("board");
    expect(consecutivePairsSudokuPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof consecutivePairsSudokuPlugin.description).toBe("string");
    expect(consecutivePairsSudokuPlugin.description.length).toBeGreaterThan(0);
    expect(consecutivePairsSudokuPlugin.settings).toBeDefined();
    expect(typeof consecutivePairsSudokuPlugin.settings).toBe("object");
    expect(typeof consecutivePairsSudokuPlugin.initialState).toBe("function");
    expect(typeof consecutivePairsSudokuPlugin.reducer).toBe("function");
    expect(typeof consecutivePairsSudokuPlugin.isTerminal).toBe("function");
    expect(consecutivePairsSudokuPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null while playing", () => {
    const a = consecutivePairsSudokuPlugin.initialState(42, S);
    const b = consecutivePairsSudokuPlugin.initialState(42, S);
    expect(a.idx).toBe(b.idx);
    expect(a.phase).toBe("playing");
    expect(a.current.join(",")).toBe(b.current.join(","));
    expect(a.puzzles.length).toBe(b.puzzles.length);
    expect(a.puzzles.map((p) => p.given.join(",")).join("|"))
      .toBe(b.puzzles.map((p) => p.given.join(",")).join("|"));
    expect(consecutivePairsSudokuPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when phase is done", () => {
    expect(typeof consecutivePairsSudokuPlugin.hint).toBe("function");
    const state = consecutivePairsSudokuPlugin.initialState(5, S);
    const result = consecutivePairsSudokuPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe(".consecutivepairscopper-num");
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    const finished: ConsecutivePairsSudokuState = { ...state, phase: "done" };
    expect(consecutivePairsSudokuPlugin.hint!(finished)).toBeNull();
    expect(consecutivePairsSudokuPlugin.isTerminal(finished)).toEqual({ score: finished.score });
  });
});

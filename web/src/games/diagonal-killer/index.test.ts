import { describe, it, expect } from "vitest";
import { diagonalKillerPlugin } from "./index.js";

describe("diagonalKillerPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(diagonalKillerPlugin.id).toBe("diagonal-killer");
    expect(diagonalKillerPlugin.title).toBe("Diagonal Killer Sudoku");
    expect(diagonalKillerPlugin.category).toBe("board");
    expect(diagonalKillerPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diagonalKillerPlugin.description).toBe("string");
    expect(diagonalKillerPlugin.description.length).toBeGreaterThan(0);
    expect(diagonalKillerPlugin.settings).toBeDefined();
    expect(diagonalKillerPlugin.settings.dummy.kind).toBe("boolean");
    expect(diagonalKillerPlugin.settings.dummy.default).toBe(false);
    expect(typeof diagonalKillerPlugin.initialState).toBe("function");
    expect(typeof diagonalKillerPlugin.reducer).toBe("function");
    expect(typeof diagonalKillerPlugin.isTerminal).toBe("function");
    expect(typeof diagonalKillerPlugin.hint).toBe("function");
    expect(diagonalKillerPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = diagonalKillerPlugin.initialState(42);
    const b = diagonalKillerPlugin.initialState(42);
    const c = diagonalKillerPlugin.initialState(43);
    expect(a.puzzles.length).toBe(6);
    expect(a.phase).toBe("playing");
    expect(a.idx).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.score).toBe(0);
    expect(a.correct).toBe(0);
    // same seed -> identical puzzle order (deterministic)
    expect(b.puzzles.map((p) => p.grid)).toEqual(a.puzzles.map((p) => p.grid));
    // different seed should (very likely) produce a different ordering
    const sameOrder = a.puzzles.every((p, i) => p.grid === c.puzzles[i]!.grid);
    expect(sameOrder).toBe(false);
    expect(diagonalKillerPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = diagonalKillerPlugin.initialState(7);
    const target = diagonalKillerPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-diagonal-killer-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(diagonalKillerPlugin.hint!(done)).toBeNull();
    expect(diagonalKillerPlugin.isTerminal(done)).toEqual({ score: 0 });

    const result = { ...playing, phase: "result" as const };
    expect(diagonalKillerPlugin.hint!(result)).toBeNull();
  });
});

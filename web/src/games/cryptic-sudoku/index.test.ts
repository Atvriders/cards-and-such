import { describe, it, expect } from "vitest";
import { crypticSudokuPlugin } from "./index.js";
import type { CrypticSudokuSettings } from "./state.js";

const S: CrypticSudokuSettings = { dummy: true };

describe("crypticSudokuPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(crypticSudokuPlugin.id).toBe("cryptic-sudoku");
    expect(crypticSudokuPlugin.title).toBe("Cryptic Sudoku");
    expect(crypticSudokuPlugin.category).toBe("board");
    expect(crypticSudokuPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof crypticSudokuPlugin.description).toBe("string");
    expect(crypticSudokuPlugin.description.length).toBeGreaterThan(0);
    expect(crypticSudokuPlugin.settings).toBeDefined();
    expect(crypticSudokuPlugin.settings.dummy.kind).toBe("boolean");
    expect(crypticSudokuPlugin.settings.dummy.default).toBe(false);
    expect(typeof crypticSudokuPlugin.initialState).toBe("function");
    expect(typeof crypticSudokuPlugin.reducer).toBe("function");
    expect(typeof crypticSudokuPlugin.isTerminal).toBe("function");
    expect(typeof crypticSudokuPlugin.hint).toBe("function");
    expect(crypticSudokuPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = crypticSudokuPlugin.initialState(42, S);
    const b = crypticSudokuPlugin.initialState(42, S);
    const c = crypticSudokuPlugin.initialState(43, S);
    expect(a.puzzles.length).toBe(6);
    expect(a.phase).toBe("playing");
    expect(a.idx).toBe(0);
    expect(a.score).toBe(0);
    expect(a.correct).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    // same seed -> same puzzle ordering
    expect(b.puzzles[0]!.prompt).toBe(a.puzzles[0]!.prompt);
    expect(b.puzzles.map((p) => p.prompt)).toEqual(a.puzzles.map((p) => p.prompt));
    // different seed should (very likely) produce a different ordering
    const sameOrder = a.puzzles.every((p, i) => p.prompt === c.puzzles[i]!.prompt);
    expect(sameOrder).toBe(false);
    expect(crypticSudokuPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = crypticSudokuPlugin.initialState(7, S);
    const target = crypticSudokuPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-cryptic-sudoku-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(crypticSudokuPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(crypticSudokuPlugin.hint!(result)).toBeNull();
  });
});

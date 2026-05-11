import { describe, it, expect } from "vitest";
import { antiKingSudokuMiniPlugin } from "./index.js";
import type { AntiKingSudokuMiniSettings } from "./state.js";

const S: AntiKingSudokuMiniSettings = { dummy: true };

describe("antiKingSudokuMiniPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(antiKingSudokuMiniPlugin.id).toBe("anti-king-sudoku-mini");
    expect(antiKingSudokuMiniPlugin.title).toBe("Anti-King Sudoku Mini");
    expect(antiKingSudokuMiniPlugin.category).toBe("board");
    expect(antiKingSudokuMiniPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof antiKingSudokuMiniPlugin.description).toBe("string");
    expect(antiKingSudokuMiniPlugin.description.length).toBeGreaterThan(0);
    expect(antiKingSudokuMiniPlugin.settings).toBeDefined();
    expect(antiKingSudokuMiniPlugin.settings.dummy.kind).toBe("boolean");
    expect(antiKingSudokuMiniPlugin.settings.dummy.default).toBe(false);
    expect(typeof antiKingSudokuMiniPlugin.initialState).toBe("function");
    expect(typeof antiKingSudokuMiniPlugin.reducer).toBe("function");
    expect(typeof antiKingSudokuMiniPlugin.isTerminal).toBe("function");
    expect(typeof antiKingSudokuMiniPlugin.hint).toBe("function");
    expect(antiKingSudokuMiniPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = antiKingSudokuMiniPlugin.initialState(42, S);
    const b = antiKingSudokuMiniPlugin.initialState(42, S);
    const c = antiKingSudokuMiniPlugin.initialState(43, S);
    expect(a.puzzles.length).toBe(6);
    expect(a.idx).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.score).toBe(0);
    expect(a.correct).toBe(0);
    expect(a.phase).toBe("playing");
    // same seed -> same first puzzle
    expect(b.puzzles[0]!.prompt).toBe(a.puzzles[0]!.prompt);
    expect(b.puzzles[0]!.grid).toBe(a.puzzles[0]!.grid);
    // different seed should (very likely) produce a different ordering
    const sameOrder = a.puzzles.every((p, i) => p.prompt === c.puzzles[i]!.prompt);
    expect(sameOrder).toBe(false);
    expect(antiKingSudokuMiniPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = antiKingSudokuMiniPlugin.initialState(7, S);
    const target = antiKingSudokuMiniPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-anti-king-sudoku-mini-answer-0"]');
    expect(target!.pulses).toBe(3);

    const done = { ...playing, phase: "done" as const };
    expect(antiKingSudokuMiniPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(antiKingSudokuMiniPlugin.hint!(result)).toBeNull();
  });
});

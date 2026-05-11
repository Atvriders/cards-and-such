import { describe, it, expect } from "vitest";
import { chaosSudokuMiniPlugin } from "./index.js";
import type { ChaosSudokuMiniSettings, ChaosSudokuMiniState } from "./state.js";

const S: ChaosSudokuMiniSettings = { puzzles: "8" };

describe("chaosSudokuMiniPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(chaosSudokuMiniPlugin.id).toBe("chaos-sudoku-mini");
    expect(chaosSudokuMiniPlugin.title).toBe("Chaos Sudoku Mini");
    expect(chaosSudokuMiniPlugin.category).toBe("board");
    expect(chaosSudokuMiniPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof chaosSudokuMiniPlugin.description).toBe("string");
    expect(chaosSudokuMiniPlugin.description.length).toBeGreaterThan(0);
    expect(chaosSudokuMiniPlugin.settings).toBeDefined();
    expect(chaosSudokuMiniPlugin.settings.puzzles.kind).toBe("enum");
    expect(chaosSudokuMiniPlugin.settings.puzzles.default).toBe("8");
    expect(chaosSudokuMiniPlugin.settings.puzzles.options).toEqual(["8"]);
    expect(typeof chaosSudokuMiniPlugin.initialState).toBe("function");
    expect(typeof chaosSudokuMiniPlugin.reducer).toBe("function");
    expect(typeof chaosSudokuMiniPlugin.isTerminal).toBe("function");
    expect(typeof chaosSudokuMiniPlugin.hint).toBe("function");
    expect(chaosSudokuMiniPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = chaosSudokuMiniPlugin.initialState(42, S);
    const b = chaosSudokuMiniPlugin.initialState(42, S);
    expect(a.phase).toBe("playing");
    expect(a.currentIndex).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.resolved).toBe(false);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    expect(a.puzzles.length).toBeGreaterThan(0);
    expect(a.puzzles.length).toBeLessThanOrEqual(8);
    // same seed -> same first puzzle scenario
    expect(b.puzzles[0]!.scenario).toBe(a.puzzles[0]!.scenario);
    expect(b.puzzles.length).toBe(a.puzzles.length);
    expect(chaosSudokuMiniPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = chaosSudokuMiniPlugin.initialState(7, S);
    const target = chaosSudokuMiniPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-chaos-sudoku-mini-answer-0"]');
    expect(target!.pulses).toBe(3);

    const done: ChaosSudokuMiniState = { ...playing, phase: "done" };
    expect(chaosSudokuMiniPlugin.hint!(done)).toBeNull();
    expect(chaosSudokuMiniPlugin.isTerminal(done)).toEqual({ score: done.score });

    const result: ChaosSudokuMiniState = { ...playing, phase: "result" };
    expect(chaosSudokuMiniPlugin.hint!(result)).toBeNull();
  });
});

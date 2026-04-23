import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { QuordleState } from "./state.js";

const defSettings = {};

describe("Quordle initialState", () => {
  it("picks 4 unique target words", () => {
    const s = initialState(1, defSettings);
    expect(s.targets.length).toBe(4);
    const unique = new Set(s.targets);
    expect(unique.size).toBe(4);
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(42, defSettings);
    const s2 = initialState(42, defSettings);
    expect(s1.targets).toEqual(s2.targets);
  });

  it("starts with empty guesses and not gameOver", () => {
    const s = initialState(1, defSettings);
    expect(s.guesses).toHaveLength(0);
    expect(s.gameOver).toBe(false);
    expect(s.solved).toEqual([false, false, false, false]);
  });
});

describe("Quordle reducer", () => {
  function makeState(overrides: Partial<QuordleState> = {}): QuordleState {
    return { ...initialState(1, defSettings), ...overrides };
  }

  it("type adds a letter", () => {
    const s = makeState({ currentInput: "" });
    const s2 = reducer(s, { type: "type", char: "A" });
    expect(s2.currentInput).toBe("A");
  });

  it("type limited to 5 letters", () => {
    const s = makeState({ currentInput: "ABCDE" });
    const s2 = reducer(s, { type: "type", char: "F" });
    expect(s2.currentInput).toBe("ABCDE");
  });

  it("delete removes last char", () => {
    const s = makeState({ currentInput: "ABCD" });
    const s2 = reducer(s, { type: "delete" });
    expect(s2.currentInput).toBe("ABC");
  });

  it("submit requires 5 letters", () => {
    const s = makeState({ currentInput: "ABC" });
    const s2 = reducer(s, { type: "submit" });
    expect(s2.message).toBe("Need 5 letters");
    expect(s2.guesses).toHaveLength(0);
  });

  it("submit scores guess against all targets", () => {
    // Force targets to known values
    const s = makeState({
      targets: ["BRAVE", "CRANE", "DRIVE", "FLAME"],
      currentInput: "BRAVE",
      guesses: [],
      gridResults: [[], [], [], []],
      solved: [false, false, false, false],
    });
    const s2 = reducer(s, { type: "submit" });
    expect(s2.guesses).toHaveLength(1);
    expect(s2.solved[0]).toBe(true); // BRAVE === BRAVE
    expect(s2.currentInput).toBe("");
  });

  it("after 9 guesses game ends", () => {
    // Build state with 8 guesses already
    const base = makeState({
      targets: ["BRAVE", "CRANE", "DRIVE", "FLAME"],
      gridResults: [[], [], [], []],
      solved: [false, false, false, false],
    });
    // Manually push 8 guesses
    let s = base;
    const guessWords = ["ABOUT","SOUND","LIGHT","MUSIC","WATER","GREAT","JUDGE","KNIFE"];
    for (const w of guessWords) {
      s = reducer({ ...s, currentInput: w }, { type: "submit" });
    }
    expect(s.guesses).toHaveLength(8);
    s = reducer({ ...s, currentInput: "SOUTH" }, { type: "submit" });
    expect(s.guesses).toHaveLength(9);
    expect(s.gameOver).toBe(true);
  });

  it("all 4 solved ends game", () => {
    const targets: [string, string, string, string] = ["ABOUT", "SOUND", "LIGHT", "MUSIC"];
    let s = makeState({
      targets,
      gridResults: [[], [], [], []],
      solved: [false, false, false, false],
    });
    for (const w of targets) {
      s = reducer({ ...s, currentInput: w }, { type: "submit" });
    }
    expect(s.solved.every(Boolean)).toBe(true);
    expect(s.gameOver).toBe(true);
  });
});

describe("Quordle isTerminal", () => {
  it("returns null when in progress", () => {
    expect(isTerminal(initialState(1, defSettings))).toBeNull();
  });

  it("returns positive score when all solved", () => {
    const targets: [string, string, string, string] = ["ABOUT", "SOUND", "LIGHT", "MUSIC"];
    let s = initialState(1, defSettings);
    s = { ...s, targets, gridResults: [[], [], [], []], solved: [false, false, false, false] };
    for (const w of targets) {
      s = reducer({ ...s, currentInput: w }, { type: "submit" });
    }
    const r = isTerminal(s);
    expect(r).not.toBeNull();
    expect(r!.score).toBeGreaterThan(0);
  });
});

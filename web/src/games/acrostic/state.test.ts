import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { AcrosticState } from "./state.js";

const defSettings = {};

describe("Acrostic initialState", () => {
  it("picks a puzzle and creates empty clueInputs", () => {
    const s = initialState(1, defSettings);
    expect(s.puzzle.clues.length).toBeGreaterThan(0);
    expect(s.clueInputs.length).toBe(s.puzzle.clues.length);
    expect(s.clueInputs.every(v => v === "")).toBe(true);
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(42, defSettings);
    const s2 = initialState(42, defSettings);
    expect(s1.puzzle.quote).toBe(s2.puzzle.quote);
  });

  it("starts not gameOver", () => {
    const s = initialState(1, defSettings);
    expect(s.gameOver).toBe(false);
    expect(s.checked).toBe(false);
    expect(s.score).toBe(0);
  });

  it("selectedClue starts at 0", () => {
    const s = initialState(1, defSettings);
    expect(s.selectedClue).toBe(0);
  });
});

describe("Acrostic reducer", () => {
  function makeState(overrides: Partial<AcrosticState> = {}): AcrosticState {
    return { ...initialState(1, defSettings), ...overrides };
  }

  it("type appends char to currentInput", () => {
    const s = makeState({ selectedClue: 0 });
    const s2 = reducer(s, { type: "type", char: "A" });
    expect(s2.currentInput).toBe("A");
  });

  it("delete removes last char", () => {
    const s = makeState({ currentInput: "SUN", selectedClue: 0 });
    const s2 = reducer(s, { type: "delete" });
    expect(s2.currentInput).toBe("SU");
  });

  it("clear empties input", () => {
    const s = makeState({ currentInput: "MOON", selectedClue: 0 });
    const s2 = reducer(s, { type: "clear" });
    expect(s2.currentInput).toBe("");
  });

  it("selectClue saves current input and loads next", () => {
    const s = makeState({ selectedClue: 0, currentInput: "STAR", clueInputs: ["", "", "", "", ""] });
    const s2 = reducer(s, { type: "selectClue", index: 1 });
    expect(s2.clueInputs[0]).toBe("STAR");
    expect(s2.selectedClue).toBe(1);
    expect(s2.currentInput).toBe("");
  });

  it("check with all correct answers gives score 100", () => {
    const base = initialState(1, defSettings);
    const answers = base.puzzle.clues.map(c => c.answer);
    const s = makeState({
      clueInputs: answers,
      selectedClue: null,
      currentInput: "",
    });
    const s2 = reducer(s, { type: "check" });
    expect(s2.gameOver).toBe(true);
    expect(s2.score).toBe(100);
  });

  it("check with all wrong answers gives score 0", () => {
    const s = makeState({
      clueInputs: ["ZZZ", "ZZZ", "ZZZ", "ZZZ", "ZZZ"],
      selectedClue: null,
      currentInput: "",
    });
    const s2 = reducer(s, { type: "check" });
    expect(s2.score).toBe(0);
  });

  it("no-ops when gameOver", () => {
    const s = makeState({ gameOver: true });
    const s2 = reducer(s, { type: "type", char: "A" });
    expect(s2).toBe(s);
  });
});

describe("Acrostic isTerminal", () => {
  it("returns null when in progress", () => {
    expect(isTerminal(initialState(1, defSettings))).toBeNull();
  });

  it("returns score when gameOver", () => {
    const s = { ...initialState(1, defSettings), gameOver: true, score: 60 };
    expect(isTerminal(s)?.score).toBe(60);
  });
});

import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings4x3 = { gridSize: "4" as const, startFilled: "3" as const };
const settings3x3 = { gridSize: "3" as const, startFilled: "3" as const };

describe("VisualMemoryGrid initialState", () => {
  it("starts in show phase with correct grid size", () => {
    const s = initialState(42, settings4x3);
    expect(s.phase).toBe("show");
    expect(s.gridSize).toBe(4);
    expect(s.pattern.length).toBe(16);
  });

  it("pattern has correct number of filled cells", () => {
    const s = initialState(42, settings4x3);
    const filledCount = s.pattern.filter(Boolean).length;
    expect(filledCount).toBe(3);
  });

  it("same seed produces same pattern", () => {
    const s1 = initialState(7, settings4x3);
    const s2 = initialState(7, settings4x3);
    expect(s1.pattern).toEqual(s2.pattern);
  });

  it("selected starts all false", () => {
    const s = initialState(42, settings4x3);
    expect(s.selected.every(v => v === false)).toBe(true);
  });
});

describe("VisualMemoryGrid toggle", () => {
  it("toggle flips a cell in recall phase", () => {
    const s = reducer(initialState(42, settings4x3), { type: "hide" });
    const s2 = reducer(s, { type: "toggle", index: 0 });
    expect(s2.selected[0]).toBe(true);
    const s3 = reducer(s2, { type: "toggle", index: 0 });
    expect(s3.selected[0]).toBe(false);
  });

  it("toggle does nothing in show phase", () => {
    const s = initialState(42, settings4x3);
    const s2 = reducer(s, { type: "toggle", index: 0 });
    expect(s2.selected[0]).toBe(false);
  });
});

describe("VisualMemoryGrid submit", () => {
  function makeRecallWithCorrect(seed: number): ReturnType<typeof initialState> {
    const s = initialState(seed, settings3x3);
    const hidden = reducer(s, { type: "hide" });
    return { ...hidden, selected: [...s.pattern] };
  }

  it("correct selection transitions to feedback with lastCorrect=true", () => {
    const s = makeRecallWithCorrect(42);
    const s2 = reducer(s, { type: "submit" });
    expect(s2.phase).toBe("feedback");
    expect(s2.lastCorrect).toBe(true);
  });

  it("wrong selection loses a life", () => {
    const s = reducer(initialState(42, settings3x3), { type: "hide" });
    const s2 = reducer(s, { type: "submit" });
    expect(s2.lives).toBe(2);
    expect(s2.lastCorrect).toBe(false);
  });

  it("correct round increases score by filledCount", () => {
    const s = makeRecallWithCorrect(42);
    const s2 = reducer(s, { type: "submit" });
    expect(s2.score).toBe(s.filledCount);
  });

  it("game ends when lives reach 0", () => {
    let s = initialState(42, settings3x3);
    for (let i = 0; i < 3; i++) {
      s = reducer(s, { type: "hide" });
      s = reducer(s, { type: "submit" });
      if (s.phase === "feedback") s = reducer(s, { type: "next" });
    }
    expect(s.ended).toBe(true);
  });
});

describe("VisualMemoryGrid next and isTerminal", () => {
  it("next advances round and increases filledCount on correct", () => {
    const s = initialState(42, settings4x3);
    const recall = { ...s, phase: "recall" as const, selected: [...s.pattern] };
    const feedback = reducer(recall, { type: "submit" });
    const next = reducer(feedback, { type: "next" });
    expect(next.round).toBe(2);
    expect(next.filledCount).toBe(4);
    expect(next.phase).toBe("show");
  });

  it("isTerminal returns null while playing", () => {
    const s = initialState(42, settings4x3);
    expect(isTerminal(s)).toBeNull();
  });

  it("isTerminal returns score when ended", () => {
    const s = { ...initialState(42, settings4x3), ended: true, score: 15 };
    expect(isTerminal(s)?.score).toBe(15);
  });
});

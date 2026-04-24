import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { questions: "10" as const };

describe("HotSeat initialState", () => {
  it("creates correct number of questions", () => {
    const s = initialState(1, defaultSettings);
    expect(s.questions.length).toBe(10);
  });

  it("starts at index 0 in playing phase", () => {
    const s = initialState(1, defaultSettings);
    expect(s.currentIndex).toBe(0);
    expect(s.phase).toBe("playing");
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(33, defaultSettings);
    const s2 = initialState(33, defaultSettings);
    expect(s1.questions).toEqual(s2.questions);
  });

  it("all questions are non-empty strings", () => {
    const s = initialState(1, defaultSettings);
    for (const q of s.questions) {
      expect(typeof q).toBe("string");
      expect(q.length).toBeGreaterThan(0);
    }
  });
});

describe("HotSeat reducer", () => {
  it("next advances to next question", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "next" });
    expect(s2.currentIndex).toBe(1);
    expect(s2.phase).toBe("playing");
  });

  it("finishes after all questions", () => {
    let s = initialState(1, { questions: "10" as const });
    for (let i = 0; i < 10; i++) s = reducer(s, { type: "next" });
    expect(s.phase).toBe("done");
  });

  it("does nothing when already done", () => {
    let s = initialState(1, { questions: "10" as const });
    for (let i = 0; i < 10; i++) s = reducer(s, { type: "next" });
    const s2 = reducer(s, { type: "next" });
    expect(s2.currentIndex).toBe(s.currentIndex);
  });
});

describe("HotSeat isTerminal", () => {
  it("returns null while playing", () => {
    expect(isTerminal(initialState(1, defaultSettings))).toBeNull();
  });

  it("returns score equal to question count when done", () => {
    let s = initialState(1, { questions: "10" as const });
    for (let i = 0; i < 10; i++) s = reducer(s, { type: "next" });
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBe(10);
  });
});

import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { rounds: "10" as const };

describe("MostLikelyTo initialState", () => {
  it("creates correct number of prompts", () => {
    const s = initialState(1, defaultSettings);
    expect(s.prompts.length).toBe(10);
  });

  it("starts at index 0 with 0 votes", () => {
    const s = initialState(1, defaultSettings);
    expect(s.currentIndex).toBe(0);
    expect(s.votes).toBe(0);
    expect(s.phase).toBe("playing");
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(55, defaultSettings);
    const s2 = initialState(55, defaultSettings);
    expect(s1.prompts).toEqual(s2.prompts);
  });

  it("all prompts are non-empty strings", () => {
    const s = initialState(1, defaultSettings);
    for (const p of s.prompts) {
      expect(typeof p).toBe("string");
      expect(p.length).toBeGreaterThan(0);
    }
  });
});

describe("MostLikelyTo reducer - vote", () => {
  it("vote adds to votes total", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "vote", count: 3 });
    expect(s2.votes).toBe(3);
  });

  it("multiple votes accumulate", () => {
    let s = initialState(1, defaultSettings);
    s = reducer(s, { type: "vote", count: 2 });
    s = reducer(s, { type: "vote", count: 4 });
    expect(s.votes).toBe(6);
  });
});

describe("MostLikelyTo reducer - next", () => {
  it("next advances prompt index", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "next" });
    expect(s2.currentIndex).toBe(1);
  });

  it("finishes after last prompt", () => {
    let s = initialState(1, { rounds: "10" as const });
    for (let i = 0; i < 10; i++) s = reducer(s, { type: "next" });
    expect(s.phase).toBe("done");
  });
});

describe("MostLikelyTo isTerminal", () => {
  it("returns null while playing", () => {
    expect(isTerminal(initialState(1, defaultSettings))).toBeNull();
  });

  it("returns votes as score when done", () => {
    let s = initialState(1, { rounds: "10" as const });
    s = reducer(s, { type: "vote", count: 5 });
    for (let i = 0; i < 10; i++) s = reducer(s, { type: "next" });
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBe(5);
  });
});

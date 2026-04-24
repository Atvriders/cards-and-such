import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { rounds: "10" as const, timeLimit: "5" as const };

describe("FiveSecondRule initialState", () => {
  it("creates correct number of prompts", () => {
    const s = initialState(1, defaultSettings);
    expect(s.prompts.length).toBe(10);
  });

  it("starts with correct timeLeft", () => {
    const s = initialState(1, defaultSettings);
    expect(s.timeLeft).toBe(5);
    expect(s.phase).toBe("playing");
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(9, defaultSettings);
    const s2 = initialState(9, defaultSettings);
    expect(s1.prompts).toEqual(s2.prompts);
  });
});

describe("FiveSecondRule reducer - tick", () => {
  it("tick decrements timeLeft", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "tick" });
    expect(s2.timeLeft).toBe(4);
  });

  it("tick at 1 moves to result/fail", () => {
    let s = initialState(1, defaultSettings);
    for (let i = 0; i < 5; i++) s = reducer(s, { type: "tick" });
    expect(s.phase).toBe("result");
    expect(s.lastResult).toBe("fail");
    expect(s.failed).toBe(1);
  });
});

describe("FiveSecondRule reducer - got-it / pass", () => {
  it("got-it marks success and moves to result", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "got-it" });
    expect(s2.phase).toBe("result");
    expect(s2.succeeded).toBe(1);
    expect(s2.lastResult).toBe("success");
  });

  it("pass marks fail and moves to result", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "pass" });
    expect(s2.phase).toBe("result");
    expect(s2.failed).toBe(1);
    expect(s2.lastResult).toBe("fail");
  });
});

describe("FiveSecondRule reducer - next", () => {
  it("next advances to next prompt", () => {
    let s = initialState(1, defaultSettings);
    s = reducer(s, { type: "got-it" });
    s = reducer(s, { type: "next" });
    expect(s.currentIndex).toBe(1);
    expect(s.phase).toBe("playing");
    expect(s.timeLeft).toBe(5);
  });

  it("finishes after last prompt", () => {
    let s = initialState(1, { rounds: "10" as const, timeLimit: "5" as const });
    for (let i = 0; i < 10; i++) {
      s = reducer(s, { type: "got-it" });
      s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
  });
});

describe("FiveSecondRule isTerminal", () => {
  it("returns null while playing", () => {
    expect(isTerminal(initialState(1, defaultSettings))).toBeNull();
  });

  it("returns succeeded count as score", () => {
    let s = initialState(1, { rounds: "10" as const, timeLimit: "5" as const });
    for (let i = 0; i < 10; i++) {
      s = reducer(s, { type: "got-it" });
      s = reducer(s, { type: "next" });
    }
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBe(10);
  });
});

import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s20 = { target: "20" as const };

describe("initialState", () => {
  it("starts at 0 rally count", () => {
    const s = initialState(1, s20);
    expect(s.rallyCount).toBe(0);
    expect(s.totalHits).toBe(0);
  });

  it("starts in rally phase", () => {
    expect(initialState(1, s20).phase).toBe("rally");
  });

  it("is deterministic", () => {
    const a = initialState(123, s20);
    const b = initialState(123, s20);
    expect(a.hitWindow).toBeCloseTo(b.hitWindow);
  });
});

describe("reducer", () => {
  it("exact hit on window counts", () => {
    const s = initialState(1, s20);
    const s2 = reducer(s, { type: "hit", timing: s.hitWindow });
    expect(s2.totalHits).toBe(1);
    expect(s2.streak).toBe(1);
  });

  it("far miss does not count", () => {
    const s = initialState(1, s20);
    const missTarget = s.hitWindow > 0.5 ? 0 : 1;
    const s2 = reducer(s, { type: "hit", timing: missTarget });
    expect(s2.totalHits).toBe(0);
    expect(s2.streak).toBe(0);
  });

  it("completes after targetRally hits", () => {
    let s = initialState(5, s20);
    for (let i = 0; i < 20; i++) {
      if (s.phase === "rally") s = reducer(s, { type: "hit", timing: s.hitWindow });
      else if (s.phase === "miss") s = reducer(s, { type: "restart" });
      else break;
    }
    expect(s.phase).toBe("done");
  });

  it("no-op when done", () => {
    const done = { ...initialState(1, s20), phase: "done" as const };
    expect(reducer(done, { type: "hit", timing: 0.5 })).toBe(done);
  });
});

describe("isTerminal", () => {
  it("null during play", () => {
    expect(isTerminal(initialState(1, s20))).toBeNull();
  });

  it("returns positive score when done", () => {
    const done = { ...initialState(1, s20), phase: "done" as const, totalHits: 18, targetRally: 20, longestStreak: 10 };
    const result = isTerminal(done);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThan(0);
  });

  it("perfect score includes streak bonus", () => {
    const done = { ...initialState(1, s20), phase: "done" as const, totalHits: 20, targetRally: 20, longestStreak: 20 };
    expect(isTerminal(done)!.score).toBe(840);
  });
});

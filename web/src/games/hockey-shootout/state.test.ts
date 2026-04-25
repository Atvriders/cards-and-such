import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s5 = { shots: "5" as const };

describe("initialState", () => {
  it("starts with 0 goals", () => {
    const s = initialState(1, s5);
    expect(s.goals).toBe(0);
    expect(s.shotIndex).toBe(0);
  });

  it("starts in aim phase", () => {
    expect(initialState(1, s5).phase).toBe("aim");
  });

  it("is deterministic", () => {
    const a = initialState(55, s5);
    const b = initialState(55, s5);
    expect(a.goalieReact).toBeCloseTo(b.goalieReact);
  });
});

describe("reducer", () => {
  it("shoot records attempt", () => {
    const s = initialState(1, s5);
    const s2 = reducer(s, { type: "shoot" });
    expect(s2.attempts.length).toBe(1);
    expect(s2.shotIndex).toBe(1);
  });

  it("set-fake clamped to 0..1", () => {
    const s = initialState(1, s5);
    expect(reducer(s, { type: "set-fake", value: 5 }).fakeDir).toBe(1);
    expect(reducer(s, { type: "set-fake", value: -1 }).fakeDir).toBe(0);
  });

  it("completes after totalShots", () => {
    let s = initialState(10, s5);
    let iters = 0;
    while (s.phase !== "done" && iters < 50) {
      if (s.phase === "aim") s = reducer(s, { type: "shoot" });
      else s = reducer(s, { type: "next" });
      iters++;
    }
    expect(s.phase).toBe("done");
    expect(s.shotIndex).toBe(5);
  });

  it("no-op when done", () => {
    const done = { ...initialState(1, s5), phase: "done" as const };
    expect(reducer(done, { type: "shoot" })).toBe(done);
  });
});

describe("isTerminal", () => {
  it("null during play", () => {
    expect(isTerminal(initialState(1, s5))).toBeNull();
  });

  it("perfect score = 1000", () => {
    const done = { ...initialState(1, s5), phase: "done" as const, goals: 5, totalShots: 5 };
    expect(isTerminal(done)!.score).toBe(1000);
  });

  it("0 goals = 0 score", () => {
    const done = { ...initialState(1, s5), phase: "done" as const, goals: 0, totalShots: 5 };
    expect(isTerminal(done)!.score).toBe(0);
  });

  it("partial score", () => {
    const done = { ...initialState(1, s5), phase: "done" as const, goals: 3, totalShots: 5 };
    expect(isTerminal(done)!.score).toBe(600);
  });
});

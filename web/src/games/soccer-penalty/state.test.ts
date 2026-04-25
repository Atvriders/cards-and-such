import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s5 = { kicks: "5" as const };

describe("initialState", () => {
  it("starts with 0 goals and 0 kicks", () => {
    const s = initialState(1, s5);
    expect(s.goals).toBe(0);
    expect(s.kickIndex).toBe(0);
  });

  it("starts in aim phase", () => {
    const s = initialState(1, s5);
    expect(s.phase).toBe("aim");
  });

  it("is deterministic", () => {
    const a = initialState(77, s5);
    const b = initialState(77, s5);
    expect(a.keeperSide).toBeCloseTo(b.keeperSide);
  });
});

describe("reducer", () => {
  it("kick records result", () => {
    const s = initialState(1, s5);
    const s2 = reducer(s, { type: "kick" });
    expect(s2.kicks.length).toBe(1);
    expect(s2.kickIndex).toBe(1);
  });

  it("aim clamped", () => {
    const s = initialState(1, s5);
    expect(reducer(s, { type: "set-aim", value: 2 }).aim).toBe(1);
    expect(reducer(s, { type: "set-aim", value: -1 }).aim).toBe(0);
  });

  it("completes after totalKicks", () => {
    let s = initialState(3, s5);
    let iters = 0;
    while (s.phase !== "done" && iters < 50) {
      if (s.phase === "aim") s = reducer(s, { type: "kick" });
      else s = reducer(s, { type: "next" });
      iters++;
    }
    expect(s.phase).toBe("done");
    expect(s.kickIndex).toBe(5);
  });

  it("no-op when done", () => {
    const done = { ...initialState(1, s5), phase: "done" as const };
    expect(reducer(done, { type: "kick" })).toBe(done);
  });
});

describe("isTerminal", () => {
  it("null during play", () => {
    expect(isTerminal(initialState(1, s5))).toBeNull();
  });

  it("perfect score = 1000", () => {
    const done = { ...initialState(1, s5), phase: "done" as const, goals: 5, totalKicks: 5, kickIndex: 5 };
    expect(isTerminal(done)!.score).toBe(1000);
  });

  it("0 goals = score 0", () => {
    const done = { ...initialState(1, s5), phase: "done" as const, goals: 0, totalKicks: 5, kickIndex: 5 };
    expect(isTerminal(done)!.score).toBe(0);
  });

  it("partial score proportional", () => {
    const done = { ...initialState(1, s5), phase: "done" as const, goals: 3, totalKicks: 5, kickIndex: 5 };
    expect(isTerminal(done)!.score).toBe(600);
  });
});

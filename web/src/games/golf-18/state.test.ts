import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const easy = { difficulty: "easy" as const };
const med = { difficulty: "medium" as const };

describe("initialState", () => {
  it("has 18 holes", () => {
    const s = initialState(1, med);
    expect(s.holes.length).toBe(18);
  });

  it("starts at hole 0, select-club phase", () => {
    const s = initialState(1, med);
    expect(s.currentHole).toBe(0);
    expect(s.phase).toBe("select-club");
  });

  it("is deterministic", () => {
    const a = initialState(77, med);
    const b = initialState(77, med);
    expect(a.rngSeed).toBe(b.rngSeed);
  });
});

describe("reducer — club select", () => {
  it("selecting club moves to aim", () => {
    const s = initialState(1, med);
    const s2 = reducer(s, { type: "select-club", club: "driver" });
    expect(s2.phase).toBe("aim");
    expect(s2.club).toBe("driver");
  });

  it("can select iron", () => {
    const s = initialState(1, med);
    const s2 = reducer(s, { type: "select-club", club: "iron" });
    expect(s2.club).toBe("iron");
  });
});

describe("reducer — swinging", () => {
  it("swing produces result or hole-done phase", () => {
    const s0 = initialState(1, easy);
    const s1 = reducer(s0, { type: "select-club", club: "driver" });
    const s2 = reducer(s1, { type: "swing" });
    expect(["result", "hole-done"]).toContain(s2.phase);
  });

  it("total strokes increment on swing", () => {
    const s0 = initialState(1, easy);
    const s1 = reducer(s0, { type: "select-club", club: "driver" });
    const s2 = reducer(s1, { type: "swing" });
    expect(s2.totalStrokes).toBeGreaterThanOrEqual(1);
  });

  it("no-op when done", () => {
    const done = { ...initialState(1, med), phase: "done" as const };
    expect(reducer(done, { type: "swing" })).toBe(done);
  });
});

describe("reducer — full round", () => {
  it("completes 18 holes eventually on easy", () => {
    let s = initialState(9, easy);
    let iters = 0;
    while (s.phase !== "done" && iters < 1000) {
      if (s.phase === "select-club") s = reducer(s, { type: "select-club", club: "driver" });
      else if (s.phase === "aim") {
        s = reducer(s, { type: "set-angle", value: 0.5 });
        s = reducer(s, { type: "swing" });
      } else {
        s = reducer(s, { type: "next" });
      }
      iters++;
    }
    expect(s.phase).toBe("done");
    expect(s.totalStrokes).toBeGreaterThan(0);
  });
});

describe("isTerminal", () => {
  it("null during play", () => {
    expect(isTerminal(initialState(1, med))).toBeNull();
  });

  it("returns score when done", () => {
    const done = { ...initialState(1, med), phase: "done" as const, totalStrokes: 72 };
    expect(isTerminal(done)?.score).toBeGreaterThanOrEqual(0);
  });

  it("under par beats over par", () => {
    const under = { ...initialState(1, med), phase: "done" as const, totalStrokes: 60 };
    const over = { ...initialState(1, med), phase: "done" as const, totalStrokes: 85 };
    expect(isTerminal(under)!.score).toBeGreaterThan(isTerminal(over)!.score);
  });
});

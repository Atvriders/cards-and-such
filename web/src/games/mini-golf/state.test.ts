import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const easy = { difficulty: "easy" as const };
const med = { difficulty: "medium" as const };

describe("initialState", () => {
  it("has 9 holes, all incomplete", () => {
    const s = initialState(1, med);
    expect(s.holes.length).toBe(9);
    expect(s.holes.every((h) => !h.completed)).toBe(true);
  });

  it("starts at hole 0, aim phase", () => {
    const s = initialState(1, med);
    expect(s.currentHole).toBe(0);
    expect(s.phase).toBe("aim");
    expect(s.distanceToPin).toBeGreaterThan(0);
  });

  it("is deterministic", () => {
    const a = initialState(55, med);
    const b = initialState(55, med);
    expect(a.rngSeed).toBe(b.rngSeed);
  });
});

describe("reducer — sliders", () => {
  it("set-angle updates angle", () => {
    const s = initialState(1, med);
    expect(reducer(s, { type: "set-angle", value: 0.3 }).angle).toBeCloseTo(0.3);
  });

  it("set-power clamps to 0-1", () => {
    const s = initialState(1, med);
    expect(reducer(s, { type: "set-power", value: 1.2 }).power).toBe(1);
  });
});

describe("reducer — putting", () => {
  it("putt changes phase to result or hole-done", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "set-angle", value: 0.5 });
    const s3 = reducer(s2, { type: "set-power", value: 0.7 });
    const s4 = reducer(s3, { type: "putt" });
    expect(["result", "hole-done"]).toContain(s4.phase);
    expect(s4.strokesThisHole).toBe(1);
  });

  it("completes full 9-hole course eventually", () => {
    let s = initialState(3, easy);
    let iters = 0;
    while (s.phase !== "done" && iters < 500) {
      if (s.phase === "aim") {
        s = reducer(s, { type: "set-angle", value: 0.5 });
        s = reducer(s, { type: "set-power", value: 0.7 });
        s = reducer(s, { type: "putt" });
      } else {
        s = reducer(s, { type: "next" });
      }
      iters++;
    }
    expect(s.phase).toBe("done");
  });

  it("no-op when done", () => {
    const done = { ...initialState(1, med), phase: "done" as const };
    expect(reducer(done, { type: "putt" })).toBe(done);
  });
});

describe("isTerminal", () => {
  it("null during play", () => {
    expect(isTerminal(initialState(1, med))).toBeNull();
  });

  it("returns positive score when done", () => {
    const s = { ...initialState(1, med), phase: "done" as const, totalStrokes: 27 };
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThanOrEqual(0);
  });

  it("under-par scores more than over-par", () => {
    const under = { ...initialState(1, med), phase: "done" as const, totalStrokes: 20 };
    const over = { ...initialState(1, med), phase: "done" as const, totalStrokes: 34 };
    expect(isTerminal(under)!.score).toBeGreaterThan(isTerminal(over)!.score);
  });
});

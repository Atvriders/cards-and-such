import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s10 = { shots: "10" as const };

describe("initialState", () => {
  it("starts at 0 shots taken", () => {
    const s = initialState(1, s10);
    expect(s.shotsTaken).toBe(0);
    expect(s.madeCount).toBe(0);
    expect(s.shots.length).toBe(0);
  });

  it("starts in aim phase", () => {
    const s = initialState(1, s10);
    expect(s.phase).toBe("aim");
  });

  it("is deterministic", () => {
    const a = initialState(42, s10);
    const b = initialState(42, s10);
    expect(a.rngSeed).toBe(b.rngSeed);
    expect(a.wind).toBeCloseTo(b.wind);
  });
});

describe("reducer — shooting", () => {
  it("shoot increments shotsTaken", () => {
    const s = initialState(1, s10);
    const s2 = reducer(s, { type: "shoot" });
    expect(s2.shotsTaken).toBe(1);
  });

  it("made/missed result recorded in shots array", () => {
    const s = initialState(1, s10);
    const s2 = reducer(s, { type: "shoot" });
    expect(s2.shots.length).toBe(1);
    expect(typeof s2.shots[0]!.made).toBe("boolean");
  });

  it("completes after totalShots", () => {
    let s = initialState(7, s10);
    let iters = 0;
    while (s.phase !== "done" && iters < 50) {
      if (s.phase === "aim") s = reducer(s, { type: "shoot" });
      else s = reducer(s, { type: "next" });
      iters++;
    }
    expect(s.phase).toBe("done");
    expect(s.shotsTaken).toBe(10);
  });

  it("no-op when done", () => {
    const done = { ...initialState(1, s10), phase: "done" as const };
    expect(reducer(done, { type: "shoot" })).toBe(done);
  });
});

describe("isTerminal", () => {
  it("null during play", () => {
    expect(isTerminal(initialState(1, s10))).toBeNull();
  });

  it("returns 1000 for 100% shooting", () => {
    const done = { ...initialState(1, s10), phase: "done" as const, madeCount: 10, totalShots: 10, shotsTaken: 10 };
    expect(isTerminal(done)!.score).toBe(1000);
  });

  it("returns 0 for 0% shooting", () => {
    const done = { ...initialState(1, s10), phase: "done" as const, madeCount: 0, totalShots: 10, shotsTaken: 10 };
    expect(isTerminal(done)!.score).toBe(0);
  });

  it("partial score proportional", () => {
    const done = { ...initialState(1, s10), phase: "done" as const, madeCount: 7, totalShots: 10, shotsTaken: 10 };
    expect(isTerminal(done)!.score).toBe(700);
  });
});

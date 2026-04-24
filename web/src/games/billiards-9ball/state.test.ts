import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const easy = { difficulty: "easy" as const };
const med = { difficulty: "medium" as const };

describe("initialState", () => {
  it("starts with all balls un-pocketed", () => {
    const s = initialState(1, med);
    expect(s.pocketed.every((p) => !p)).toBe(true);
    expect(s.pocketed.length).toBe(9);
  });

  it("lowest ball starts at 1", () => {
    const s = initialState(1, med);
    expect(s.lowestBall).toBe(1);
  });

  it("is deterministic", () => {
    const s1 = initialState(99, med);
    const s2 = initialState(99, med);
    expect(s1.rngSeed).toBe(s2.rngSeed);
  });
});

describe("reducer — aim controls", () => {
  it("set-angle updates angle", () => {
    const s = initialState(1, med);
    const s2 = reducer(s, { type: "set-angle", value: 0.3 });
    expect(s2.angle).toBeCloseTo(0.3);
  });

  it("set-power clamps to 0-1", () => {
    const s = initialState(1, med);
    const s2 = reducer(s, { type: "set-power", value: 1.5 });
    expect(s2.power).toBe(1);
  });
});

describe("reducer — shooting", () => {
  it("shooting produces a result or done phase", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "shoot" });
    expect(["result", "done"]).toContain(s2.phase);
    expect(s2.turns).toBe(1);
  });

  it("eventually wins on easy difficulty with ideal aim", () => {
    let s = initialState(7, easy);
    let iters = 0;
    while (!s.winner && iters < 200) {
      if (s.phase === "aim") {
        s = reducer(s, { type: "set-angle", value: 0.5 });
        s = reducer(s, { type: "set-power", value: 0.65 });
        s = reducer(s, { type: "shoot" });
      } else {
        s = reducer(s, { type: "next" });
      }
      iters++;
    }
    expect(s.winner).toBe(true);
  });

  it("no-op after winning", () => {
    const s = { ...initialState(1, med), winner: true };
    const s2 = reducer(s, { type: "shoot" });
    expect(s2).toBe(s);
  });
});

describe("isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(1, med))).toBeNull();
  });

  it("returns positive score on win", () => {
    const s = { ...initialState(1, med), winner: true, turns: 9, fouls: 0 };
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThan(0);
  });

  it("fouls reduce score", () => {
    const s0 = { ...initialState(1, med), winner: true, turns: 10, fouls: 0 };
    const s5 = { ...initialState(1, med), winner: true, turns: 10, fouls: 5 };
    expect(isTerminal(s0)!.score).toBeGreaterThan(isTerminal(s5)!.score);
  });
});

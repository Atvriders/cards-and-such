import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s501 = { startScore: "501" as const };
const s301 = { startScore: "301" as const };

describe("initialState", () => {
  it("starts at 501 remaining", () => {
    const s = initialState(1, s501);
    expect(s.remaining).toBe(501);
    expect(s.dartsThrown).toBe(0);
  });

  it("starts at 301 for 301 mode", () => {
    expect(initialState(1, s301).remaining).toBe(301);
  });

  it("starts in aim phase", () => {
    expect(initialState(1, s501).phase).toBe("aim");
  });

  it("is deterministic", () => {
    const a = initialState(42, s501);
    const b = initialState(42, s501);
    expect(a.rngSeed).toBe(b.rngSeed);
  });
});

describe("reducer", () => {
  it("throw records dart", () => {
    const s = initialState(1, s501);
    const s2 = reducer(s, { type: "throw" });
    expect(s2.throws.length).toBe(1);
    expect(s2.dartsThrown).toBe(1);
  });

  it("remaining decreases by scored points or stays on bust", () => {
    const s = initialState(1, s501);
    const s2 = reducer(s, { type: "throw" });
    if (s2.phase === "bust") {
      expect(s2.remaining).toBe(s.remaining);
    } else {
      expect(s2.remaining).toBeLessThanOrEqual(s.remaining);
    }
  });

  it("power clamped to 0..1", () => {
    const s = initialState(1, s501);
    expect(reducer(s, { type: "set-power", value: 5 }).power).toBe(1);
    expect(reducer(s, { type: "set-power", value: -1 }).power).toBe(0);
  });

  it("game over when remaining reaches 0", () => {
    // Manually set remaining to a score achievable in one dart (e.g. bullseye = 50)
    // Keep trying seeds until one produces a done result
    let found = false;
    for (let seed = 0; seed < 100; seed++) {
      const base = initialState(seed, s501);
      const st = reducer({ ...base, remaining: 50 }, { type: "throw" });
      if (st.phase === "done") { found = true; break; }
    }
    expect(found).toBe(true);
  });
});

describe("isTerminal", () => {
  it("null during play", () => {
    expect(isTerminal(initialState(1, s501))).toBeNull();
  });

  it("9 darts scores 1000", () => {
    const done = { ...initialState(1, s501), phase: "done" as const, dartsThrown: 9 };
    expect(isTerminal(done)!.score).toBe(1000);
  });

  it("59 darts scores 0", () => {
    const done = { ...initialState(1, s501), phase: "done" as const, dartsThrown: 59 };
    expect(isTerminal(done)!.score).toBe(0);
  });

  it("more darts = lower score", () => {
    const done20 = { ...initialState(1, s501), phase: "done" as const, dartsThrown: 20 };
    const done30 = { ...initialState(1, s501), phase: "done" as const, dartsThrown: 30 };
    expect(isTerminal(done20)!.score).toBeGreaterThan(isTerminal(done30)!.score);
  });
});

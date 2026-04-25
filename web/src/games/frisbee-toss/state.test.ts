import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("FrisbeeToss initialState", () => {
  it("starts in aiming phase", () => {
    const s = initialState();
    expect(s.phase).toBe("aiming");
    expect(s.score).toBe(0);
    expect(s.round).toBe(1);
  });

  it("ring target is within bounds", () => {
    const s = initialState();
    expect(s.ringX).toBeGreaterThanOrEqual(0.2);
    expect(s.ringX).toBeLessThanOrEqual(0.8);
  });
});

describe("FrisbeeToss tick aiming", () => {
  it("aimX changes during tick", () => {
    const s = { ...initialState(), aimX: 0.5, aimDir: 1 as const };
    const s2 = reducer(s, { type: "tick", dt: 0.1 });
    expect(s2.aimX).toBeGreaterThan(0.5);
  });

  it("aimX bounces at right boundary", () => {
    const s = { ...initialState(), aimX: 0.99, aimDir: 1 as const };
    const s2 = reducer(s, { type: "tick", dt: 0.1 });
    expect(s2.aimDir).toBe(-1);
  });
});

describe("FrisbeeToss throw action", () => {
  it("transitions from aiming to throwing", () => {
    const s = initialState();
    const s2 = reducer(s, { type: "throw" });
    expect(s2.phase).toBe("throwing");
  });

  it("frisbee launches from aim position", () => {
    const s = { ...initialState(), aimX: 0.7 };
    const s2 = reducer(s, { type: "throw" });
    expect(s2.frisbeeX).toBeCloseTo(0.7);
  });
});

describe("FrisbeeToss isTerminal", () => {
  it("returns null while playing", () => {
    expect(isTerminal(initialState())).toBeNull();
  });

  it("returns score when gameover", () => {
    const s = { ...initialState(), phase: "gameover" as const, score: 300 };
    expect(isTerminal(s)?.score).toBe(300);
  });
});

import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings = { difficulty: "medium" as const };

describe("initialState", () => {
  it("starts in aim phase", () => {
    const s = initialState(1, settings);
    expect(s.phase).toBe("aim");
  });

  it("starts with 3 rings", () => {
    const s = initialState(1, settings);
    expect(s.rings).toHaveLength(3);
    expect(s.rings.every((r) => !r.hit)).toBe(true);
  });

  it("starts with score 0 and throw 1", () => {
    const s = initialState(1, settings);
    expect(s.score).toBe(0);
    expect(s.throws).toBe(1);
    expect(s.over).toBe(false);
  });
});

describe("release", () => {
  it("transitions from aim to flying", () => {
    const s = initialState(1, settings);
    const after = reducer(s, { type: "release" });
    expect(after.phase).toBe("flying");
    expect(after.t).toBe(0);
  });

  it("ignores release when not in aim phase", () => {
    const s = initialState(1, settings);
    const flying = reducer(s, { type: "release" });
    const again = reducer(flying, { type: "release" });
    expect(again).toBe(flying);
  });
});

describe("tick during flight", () => {
  it("advances t parameter", () => {
    const s = initialState(1, settings);
    const flying = reducer(s, { type: "release" });
    const after = reducer(flying, { type: "tick", dt: 0.1 });
    expect(after.t).toBeGreaterThan(0);
  });

  it("transitions to returning when t > 0.5", () => {
    const s = initialState(1, settings);
    const flying = reducer(s, { type: "release" });
    const midFlight = { ...flying, t: 0.4 };
    const after = reducer(midFlight, { type: "tick", dt: 0.5 });
    expect(after.phase === "returning" || after.phase === "caught").toBe(true);
  });
});

describe("nextThrow", () => {
  it("resets for next throw after caught", () => {
    const s = initialState(1, settings);
    const caught = { ...s, phase: "caught" as const };
    const next = reducer(caught, { type: "nextThrow" });
    expect(next.throws).toBe(2);
    expect(next.phase).toBe("aim");
    expect(next.rings).toHaveLength(3);
  });

  it("sets over=true after maxThrows", () => {
    const s = initialState(1, settings);
    const lastThrow = { ...s, phase: "caught" as const, throws: s.maxThrows };
    const after = reducer(lastThrow, { type: "nextThrow" });
    expect(after.over).toBe(true);
  });
});

describe("isTerminal", () => {
  it("returns null while playing", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns score when over", () => {
    const s = { ...initialState(1, settings), over: true, score: 170 };
    expect(isTerminal(s)!.score).toBe(170);
  });
});

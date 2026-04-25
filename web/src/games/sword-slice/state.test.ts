import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const def = { duration: "30" as const };

describe("SwordSlice initialState", () => {
  it("starts in playing phase", () => {
    expect(initialState(1, def).phase).toBe("playing");
  });

  it("starts with one target", () => {
    expect(initialState(1, def).targets.length).toBe(1);
  });

  it("timeLeft matches settings", () => {
    expect(initialState(1, def).timeLeft).toBe(30);
    expect(initialState(1, { duration: "20" }).timeLeft).toBe(20);
  });

  it("starts with zero score", () => {
    expect(initialState(1, def).score).toBe(0);
  });
});

describe("SwordSlice reducer", () => {
  it("slice removes target and adds points", () => {
    const s = initialState(1, def);
    const id = s.targets[0]!.id;
    const s2 = reducer(s, { type: "slice", id });
    expect(s2.targets.find(t => t.id === id)).toBeUndefined();
    expect(s2.score).toBeGreaterThan(0);
    expect(s2.sliced).toBe(1);
  });

  it("miss deducts 2 points (min 0)", () => {
    const s = initialState(1, def);
    const id = s.targets[0]!.id;
    const s2 = reducer(s, { type: "slice", id }); // get some points first
    const s3 = reducer(s2, { type: "miss" });
    expect(s3.score).toBe(s2.score - 2);
    expect(s3.misses).toBe(1);
  });

  it("tick decrements timeLeft", () => {
    expect(reducer(initialState(1, def), { type: "tick" }).timeLeft).toBe(29);
  });

  it("tick to zero triggers gameover", () => {
    let s = initialState(1, def);
    for (let i = 0; i < 30; i++) s = reducer(s, { type: "tick" });
    expect(s.phase).toBe("gameover");
  });
});

describe("SwordSlice isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(1, def))).toBeNull();
  });

  it("returns score when gameover", () => {
    let s = initialState(1, def);
    for (let i = 0; i < 30; i++) s = reducer(s, { type: "tick" });
    expect(isTerminal(s)).not.toBeNull();
  });
});

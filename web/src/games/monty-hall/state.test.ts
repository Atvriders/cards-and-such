import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("MontyHall", () => {
  it("initialState creates a valid car door", () => {
    const s = initialState(42, {});
    expect(s.carDoor).toBeGreaterThanOrEqual(0);
    expect(s.carDoor).toBeLessThanOrEqual(2);
    expect(s.phase).toBe("pick");
  });

  it("pickDoor moves to reveal phase and sets a goat door", () => {
    const s = initialState(1, {});
    const s2 = reducer(s, { type: "pickDoor", door: 0 });
    expect(s2.phase).toBe("reveal");
    expect(s2.initialPick).toBe(0);
    expect(s2.revealedDoor).toBeGreaterThanOrEqual(0);
    expect(s2.revealedDoor).toBeLessThanOrEqual(2);
    expect(s2.revealedDoor).not.toBe(s2.carDoor);
    expect(s2.revealedDoor).not.toBe(0);
  });

  it("deciding to stay keeps the original door", () => {
    let s = initialState(2, {});
    s = reducer(s, { type: "pickDoor", door: 1 });
    const s2 = reducer(s, { type: "decide", switchDoor: false });
    expect(s2.finalPick).toBe(1);
    expect(s2.phase).toBe("result");
  });

  it("deciding to switch changes to the remaining door", () => {
    let s = initialState(3, {});
    s = reducer(s, { type: "pickDoor", door: 0 });
    const s2 = reducer(s, { type: "decide", switchDoor: true });
    expect(s2.finalPick).not.toBe(0);
    expect(s2.finalPick).not.toBe(s2.revealedDoor);
  });

  it("isTerminal returns null when not in result phase", () => {
    const s = initialState(4, {});
    expect(isTerminal(s)).toBeNull();
  });

  it("win is tracked when final pick matches car door", () => {
    // try many seeds until we find one where switching wins
    let found = false;
    for (let seed = 0; seed < 20; seed++) {
      let s = initialState(seed, {});
      s = reducer(s, { type: "pickDoor", door: 0 });
      const s2 = reducer(s, { type: "decide", switchDoor: true });
      if (s2.won) { found = true; break; }
    }
    expect(found).toBe(true);
  });

  it("statistics accumulate across rounds", () => {
    let s = initialState(10, {});
    s = reducer(s, { type: "pickDoor", door: 0 });
    s = reducer(s, { type: "decide", switchDoor: true });
    expect(s.rounds).toBe(1);
    expect(s.switched).toBe(1);
    s = reducer(s, { type: "next" });
    s = reducer(s, { type: "pickDoor", door: 0 });
    s = reducer(s, { type: "decide", switchDoor: false });
    expect(s.rounds).toBe(2);
    expect(s.switched).toBe(1); // stayed this time
  });
});

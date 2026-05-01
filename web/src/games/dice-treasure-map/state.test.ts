import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TILES, DIGS } from "./state.js";

const S = { dummy: false };

describe("dice-treasure-map", () => {
  it("starts with full digs and 5 treasures", () => {
    const s = initialState(1, S);
    expect(s.digsLeft).toBe(DIGS);
    expect(s.treasures.length).toBe(5);
    expect(s.revealed.length).toBe(0);
  });
  it("dig consumes a dig and reveals a tile", () => {
    const s = reducer(initialState(2, S), { type: "dig" });
    expect(s.digsLeft).toBeLessThan(DIGS);
    expect(s.revealed.length).toBe(1);
  });
  it("dice are 1..6", () => {
    const s = reducer(initialState(3, S), { type: "dig" });
    expect(s.rolls![0]).toBeGreaterThanOrEqual(1);
    expect(s.rolls![0]).toBeLessThanOrEqual(6);
  });
  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(4, S))).toBeNull();
  });
  it("eventually ends after exhausting digs", () => {
    let s = initialState(5, S);
    for (let i = 0; i < DIGS * 3 && s.phase !== "done"; i++) {
      if (s.phase === "choose") s = reducer(s, { type: "dig" });
      else s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
  });
  it("revealed tiles never exceed TILES", () => {
    let s = initialState(9, S);
    for (let i = 0; i < 50 && s.phase !== "done"; i++) {
      if (s.phase === "choose") s = reducer(s, { type: "dig" });
      else s = reducer(s, { type: "next" });
    }
    expect(s.revealed.length).toBeLessThanOrEqual(TILES);
  });
});

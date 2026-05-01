import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S = { dummy: false };

describe("dice-galaxy", () => {
  it("starts with 8 unvisited planets and fuel", () => {
    const s = initialState(1, S);
    expect(s.planets.length).toBe(8);
    expect(s.planets.every(p => !p.visited)).toBe(true);
    expect(s.fuel).toBeGreaterThan(0);
  });
  it("select burns fuel", () => {
    const s = reducer(initialState(2, S), { type: "select", idx: 0 });
    expect(s.fuel).toBeLessThan(initialState(2, S).fuel);
    expect(s.rolls).not.toBeNull();
  });
  it("can't visit a visited planet again", () => {
    let s = initialState(11, S);
    s = { ...s, planets: s.planets.map((p, i) => i === 0 ? { ...p, visited: true } : p) };
    const r = reducer(s, { type: "select", idx: 0 });
    expect(r).toBe(s);
  });
  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(3, S))).toBeNull();
  });
  it("game ends after fuel runs out", () => {
    let s = initialState(4, S);
    while (s.phase !== "done") {
      if (s.phase === "roll") {
        const idx = s.planets.findIndex(p => !p.visited);
        if (idx < 0) break;
        s = reducer(s, { type: "select", idx });
      } else s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
  });
  it("score is non-negative", () => {
    const s = initialState(7, S);
    expect(s.score).toBe(0);
    const r = reducer(s, { type: "select", idx: 0 });
    expect(r.score).toBeGreaterThanOrEqual(0);
  });
});

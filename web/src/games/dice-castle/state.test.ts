import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TURNS } from "./state.js";

const S = { dummy: false };

describe("dice-castle", () => {
  it("starts with no resources", () => {
    const s = initialState(1, S);
    expect(s.res.wood).toBe(0);
    expect(s.res.stone).toBe(0);
    expect(s.res.gold).toBe(0);
    expect(s.turn).toBe(1);
  });
  it("rolling gathers resources", () => {
    const s = reducer(initialState(2, S), { type: "roll" });
    const total = s.res.wood + s.res.stone + s.res.gold;
    expect(total).toBe(3);
    expect(s.phase).toBe("build");
  });
  it("can't build without enough resources", () => {
    let s = reducer(initialState(3, S), { type: "roll" });
    s = { ...s, res: { wood: 0, stone: 0, gold: 0 } };
    const next = reducer(s, { type: "build", what: "throne" });
    expect(next).toBe(s);
  });
  it("building a wall increments walls", () => {
    let s = reducer(initialState(4, S), { type: "roll" });
    s = { ...s, res: { wood: 5, stone: 5, gold: 5 } };
    const next = reducer(s, { type: "build", what: "wall" });
    expect(next.built.walls).toBeGreaterThan(s.built.walls);
    expect(next.score).toBeGreaterThan(s.score);
  });
  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(5, S))).toBeNull();
  });
  it("game ends after TURNS turns of skipping", () => {
    let s = initialState(6, S);
    for (let i = 0; i < TURNS + 2; i++) {
      if (s.phase === "roll") s = reducer(s, { type: "roll" });
      if (s.phase === "build") s = reducer(s, { type: "skip" });
    }
    expect(s.phase).toBe("done");
  });
});

import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, LANES } from "./state.js";
const S = { dummy: false };
describe("NinjaWallMini", () => {
  it("starts in playing in middle lane", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.playerLane).toBe(1);
    expect(s.score).toBe(0);
    expect(s.obstacles).toEqual([]);
  });
  it("tick increments score and ticks", () => {
    const s = reducer(initialState(1, S), { type: "tick" });
    expect(s.ticks).toBe(1);
    expect(s.score).toBe(1);
  });
  it("lane action changes player lane", () => {
    const s = reducer(initialState(1, S), { type: "lane", dir: 1 });
    expect(s.playerLane).toBe(2);
  });
  it("lane bounds clamp at top and bottom", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "lane", dir: -1 });
    s = reducer(s, { type: "lane", dir: -1 });
    s = reducer(s, { type: "lane", dir: -1 });
    expect(s.playerLane).toBe(0);
    s = reducer(s, { type: "lane", dir: 1 });
    s = reducer(s, { type: "lane", dir: 1 });
    s = reducer(s, { type: "lane", dir: 1 });
    s = reducer(s, { type: "lane", dir: 1 });
    expect(s.playerLane).toBe(LANES - 1);
  });
  it("ticks eventually spawn obstacles", () => {
    let s = initialState(1, S);
    for (let i = 0; i < 30; i++) s = reducer(s, { type: "tick" });
    // either still playing with obstacles, or game over due to crash
    if (s.phase === "playing") expect(s.obstacles.length).toBeGreaterThan(0);
    else expect(isTerminal(s)).not.toBeNull();
  });
  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
});

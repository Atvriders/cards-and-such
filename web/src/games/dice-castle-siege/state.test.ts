import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, damageOf, WALL_MAX } from "./state.js";

const S = { dummy: false };

describe("dice-castle-siege", () => {
  it("starts at full wall", () => {
    const s = initialState(1, S);
    expect(s.wall).toBe(WALL_MAX);
    expect(s.phase).toBe("choose");
    expect(s.ammo.cannon).toBeGreaterThan(0);
  });

  it("firing reduces wall and ammo", () => {
    const s = reducer(initialState(2, S), { type: "fire", weapon: "cannon" });
    expect(s.ammo.cannon).toBe(initialState(2, S).ammo.cannon - 1);
    expect(s.wall).toBeLessThan(WALL_MAX);
    expect(s.lastDmg).toBeGreaterThan(0);
  });

  it("damageOf differs by weapon", () => {
    const a = damageOf("cannon", [6, 6]);
    const b = damageOf("trebuchet", [6, 1]);
    const c = damageOf("sapper", [5, 5]);
    expect(a).toBe(20); // 6+6 + 8 doubles bonus
    expect(b).toBe(18);
    expect(c).toBe(20);
  });

  it("can't fire weapon with no ammo", () => {
    let s = initialState(3, S);
    s = { ...s, ammo: { ...s.ammo, sapper: 0 } };
    const next = reducer(s, { type: "fire", weapon: "sapper" });
    expect(next).toBe(s);
  });

  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(4, S))).toBeNull();
  });

  it("breaching the wall awards a bonus and ends game", () => {
    let s = initialState(5, S);
    s = { ...s, wall: 1 };
    const r = reducer(s, { type: "fire", weapon: "cannon" });
    expect(r.phase).toBe("done");
    expect(r.wall).toBe(0);
    expect(r.score).toBeGreaterThan(50);
  });
});

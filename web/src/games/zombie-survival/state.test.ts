import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { ZombieSurvivalSettings } from "./state.js";

const normal: ZombieSurvivalSettings = { difficulty: "normal" };

describe("ZombieSurvival initialState", () => {
  it("starts at center column with full hp and ammo", () => {
    const s = initialState(1, normal);
    expect(s.playerX).toBe(3);
    expect(s.playerHp).toBe(5);
    expect(s.ammo).toBe(20);
  });

  it("starts with no zombies and intact barricade", () => {
    const s = initialState(1, normal);
    expect(s.zombies).toHaveLength(0);
    expect(s.barricadeHp).toBe(6);
    expect(s.gameOver).toBe(false);
  });
});

describe("ZombieSurvival reducer", () => {
  it("moveLeft decrements playerX", () => {
    const s = initialState(1, normal);
    expect(reducer(s, { type: "moveLeft" }).playerX).toBe(2);
  });

  it("moveRight increments playerX", () => {
    const s = initialState(1, normal);
    expect(reducer(s, { type: "moveRight" }).playerX).toBe(4);
  });

  it("moveLeft clamps at 0", () => {
    let s = initialState(1, normal);
    for (let i = 0; i < 10; i++) s = reducer(s, { type: "moveLeft" });
    expect(s.playerX).toBe(0);
  });

  it("shoot without zombies uses ammo", () => {
    const s = initialState(1, normal);
    const s2 = reducer(s, { type: "shoot" });
    expect(s2.ammo).toBe(s.ammo - 1);
  });

  it("shoot kills zombie in same column", () => {
    let s = initialState(1, normal);
    // Insert a zombie at playerX, low y
    s = { ...s, zombies: [{ id: 99, x: s.playerX, y: 2, hp: 1 }] };
    const before = s.zombies.length;
    s = reducer(s, { type: "shoot" });
    expect(s.zombies.length).toBeLessThan(before);
    expect(s.score).toBe(10);
  });

  it("restart resets state", () => {
    let s = initialState(1, normal);
    for (let i = 0; i < 5; i++) s = reducer(s, { type: "tick" });
    s = reducer(s, { type: "restart" });
    expect(s.gameOver).toBe(false);
    expect(s.score).toBe(0);
    expect(s.zombies).toHaveLength(0);
  });
});

describe("ZombieSurvival isTerminal", () => {
  it("returns null when active", () => {
    expect(isTerminal(initialState(1, normal))).toBeNull();
  });

  it("returns score when game over", () => {
    const s = { ...initialState(1, normal), gameOver: true, score: 50 };
    expect(isTerminal(s)?.score).toBe(50);
  });

  it("score capped at 100", () => {
    const s = { ...initialState(1, normal), gameOver: true, score: 200 };
    expect(isTerminal(s)?.score).toBe(100);
  });
});

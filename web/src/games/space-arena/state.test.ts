import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { SpaceArenaSettings } from "./state.js";

const normal: SpaceArenaSettings = { difficulty: "normal" };

describe("SpaceArena initialState", () => {
  it("player starts centered with full hp", () => {
    const s = initialState(1, normal);
    expect(s.playerX).toBe(4);
    expect(s.playerHp).toBe(5);
    expect(s.gameOver).toBe(false);
  });

  it("starts with no enemies or bullets", () => {
    const s = initialState(1, normal);
    expect(s.enemies).toHaveLength(0);
    expect(s.bullets).toHaveLength(0);
  });
});

describe("SpaceArena reducer", () => {
  it("moveLeft decrements playerX", () => {
    const s = initialState(1, normal);
    const s2 = reducer(s, { type: "moveLeft" });
    expect(s2.playerX).toBe(3);
  });

  it("moveRight increments playerX", () => {
    const s = initialState(1, normal);
    const s2 = reducer(s, { type: "moveRight" });
    expect(s2.playerX).toBe(5);
  });

  it("moveLeft clamps at 0", () => {
    let s = initialState(1, normal);
    for (let i = 0; i < 10; i++) s = reducer(s, { type: "moveLeft" });
    expect(s.playerX).toBe(0);
  });

  it("moveRight clamps at 8", () => {
    let s = initialState(1, normal);
    for (let i = 0; i < 10; i++) s = reducer(s, { type: "moveRight" });
    expect(s.playerX).toBe(8);
  });

  it("shoot adds a bullet at player position", () => {
    const s = initialState(1, normal);
    const s2 = reducer(s, { type: "shoot" });
    expect(s2.bullets).toHaveLength(1);
    expect(s2.bullets[0]!.x).toBe(s.playerX);
    expect(s2.bullets[0]!.fromPlayer).toBe(true);
  });

  it("restart resets state", () => {
    let s = initialState(1, normal);
    s = reducer(s, { type: "shoot" });
    s = reducer(s, { type: "restart" });
    expect(s.gameOver).toBe(false);
    expect(s.score).toBe(0);
    expect(s.bullets).toHaveLength(0);
  });

  it("gameOver state ignores actions except restart", () => {
    const s = { ...initialState(1, normal), gameOver: true };
    const s2 = reducer(s, { type: "shoot" });
    expect(s2.bullets).toHaveLength(0);
  });
});

describe("SpaceArena isTerminal", () => {
  it("returns null when game is ongoing", () => {
    expect(isTerminal(initialState(1, normal))).toBeNull();
  });

  it("returns score when game is over", () => {
    const s = { ...initialState(1, normal), gameOver: true, score: 60 };
    expect(isTerminal(s)?.score).toBe(20);
  });
});

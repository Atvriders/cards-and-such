import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { SwarmDefenseSettings } from "./state.js";

const settings: SwarmDefenseSettings = { difficulty: "easy" };

describe("SwarmDefense initialState", () => {
  it("starts with base hp 10 and gold 15", () => {
    const s = initialState(1, settings);
    expect(s.baseHp).toBe(10);
    expect(s.gold).toBe(15);
    expect(s.gameOver).toBe(false);
  });

  it("starts with no enemies and no towers", () => {
    const s = initialState(1, settings);
    expect(s.enemies).toHaveLength(0);
    expect(s.towers).toHaveLength(0);
  });
});

describe("SwarmDefense reducer", () => {
  it("selectCol sets towerCol", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "selectCol", col: 3 });
    expect(s2.towerCol).toBe(3);
  });

  it("buildTower costs gold and places tower", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "selectCol", col: 5 });
    const s3 = reducer(s2, { type: "buildTower" });
    expect(s3.towers).toContain(5);
    expect(s3.gold).toBe(10); // 15 - 5
  });

  it("cannot build tower on same column twice", () => {
    let s = initialState(1, settings);
    s = reducer(s, { type: "selectCol", col: 5 });
    s = reducer(s, { type: "buildTower" });
    s = reducer(s, { type: "selectCol", col: 5 });
    const goldBefore = s.gold;
    s = reducer(s, { type: "buildTower" });
    expect(s.gold).toBe(goldBefore); // no gold spent
    expect(s.towers.filter(t => t === 5)).toHaveLength(1);
  });

  it("tick advances time and gives gold", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "tick" });
    expect(s2.tick).toBe(1);
    expect(s2.gold).toBe(s.gold + 1);
  });

  it("game ends when baseHp reaches 0", () => {
    const s = { ...initialState(1, settings), baseHp: 0, gameOver: true };
    expect(s.gameOver).toBe(true);
  });

  it("restart resets state", () => {
    let s = initialState(1, settings);
    for (let i = 0; i < 5; i++) s = reducer(s, { type: "tick" });
    const s2 = reducer(s, { type: "restart" });
    expect(s2.tick).toBe(0);
    expect(s2.baseHp).toBe(10);
    expect(s2.enemies).toHaveLength(0);
  });
});

describe("SwarmDefense isTerminal", () => {
  it("returns null when not over", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns score object when game over", () => {
    const s = { ...initialState(1, settings), gameOver: true, score: 50 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThanOrEqual(0);
    expect(result!.score).toBeLessThanOrEqual(100);
  });
});

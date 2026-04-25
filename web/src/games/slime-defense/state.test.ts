import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { SlimeDefenseSettings } from "./state.js";

const normal: SlimeDefenseSettings = { difficulty: "normal" };

describe("SlimeDefense initialState", () => {
  it("starts with no slimes or traps", () => {
    const s = initialState(1, normal);
    expect(s.slimes).toHaveLength(0);
    expect(s.traps).toHaveLength(0);
  });

  it("base HP is 8 at start", () => {
    const s = initialState(1, normal);
    expect(s.baseHp).toBe(8);
    expect(s.gameOver).toBe(false);
  });
});

describe("SlimeDefense reducer", () => {
  it("selectLane sets selectedLane", () => {
    const s = initialState(1, normal);
    const s2 = reducer(s, { type: "selectLane", lane: 2 });
    expect(s2.selectedLane).toBe(2);
  });

  it("placeTrap places a trap in selected lane and deducts gold", () => {
    let s = initialState(1, normal);
    s = reducer(s, { type: "selectLane", lane: 0 });
    const goldBefore = s.gold;
    s = reducer(s, { type: "placeTrap" });
    expect(s.traps).toContain(0);
    expect(s.gold).toBe(goldBefore - 4);
  });

  it("placeTrap rejects duplicate lane", () => {
    let s = initialState(1, normal);
    s = reducer(s, { type: "selectLane", lane: 1 });
    s = reducer(s, { type: "placeTrap" });
    s = reducer(s, { type: "selectLane", lane: 1 });
    const goldBefore = s.gold;
    s = reducer(s, { type: "placeTrap" });
    // Should not place again
    expect(s.gold).toBe(goldBefore);
    expect(s.traps.filter(t => t === 1)).toHaveLength(1);
  });

  it("tick spawns slimes over time", () => {
    let s = initialState(1, normal);
    for (let i = 0; i < 8; i++) s = reducer(s, { type: "tick" });
    expect(s.slimes.length).toBeGreaterThan(0);
  });

  it("restart resets to fresh state", () => {
    let s = initialState(1, normal);
    for (let i = 0; i < 5; i++) s = reducer(s, { type: "tick" });
    s = reducer(s, { type: "restart" });
    expect(s.slimes).toHaveLength(0);
    expect(s.score).toBe(0);
    expect(s.gameOver).toBe(false);
  });
});

describe("SlimeDefense isTerminal", () => {
  it("returns null when game is active", () => {
    expect(isTerminal(initialState(1, normal))).toBeNull();
  });

  it("returns score when game over", () => {
    const s = { ...initialState(1, normal), gameOver: true, score: 80 };
    expect(isTerminal(s)?.score).toBe(20);
  });

  it("score is capped at 100", () => {
    const s = { ...initialState(1, normal), gameOver: true, score: 1000 };
    expect(isTerminal(s)?.score).toBe(100);
  });
});

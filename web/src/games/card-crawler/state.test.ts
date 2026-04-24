import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("Card Crawler", () => {
  it("initializes with 16 hidden cards", () => {
    const s = initialState(1);
    expect(s.grid.length).toBe(16);
    expect(s.grid.every(c => !c.revealed)).toBe(true);
    expect(s.playerHp).toBe(40);
    expect(s.phase).toBe("playing");
  });

  it("flipping a card reveals it", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "flip", idx: 0 });
    expect(s2.grid[0]!.revealed).toBe(true);
    expect(s2.turnCount).toBe(1);
  });

  it("flipping already-revealed card does nothing", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "flip", idx: 0 });
    const s3 = reducer(s2, { type: "flip", idx: 0 });
    expect(s3.turnCount).toBe(1); // still only 1 turn
  });

  it("heal card increases HP", () => {
    const s = { ...initialState(1), playerHp: 20, playerMaxHp: 40 };
    // Force a heal card at index 0
    const healCard = s.grid.find(c => c.kind === "heal");
    if (!healCard) return;
    const healIdx = s.grid.indexOf(healCard);
    const s2 = reducer(s, { type: "flip", idx: healIdx });
    expect(s2.playerHp).toBeGreaterThan(20);
  });

  it("enemy card reduces HP", () => {
    const s = initialState(1);
    const enemyCard = s.grid.find(c => c.kind === "enemy");
    if (!enemyCard) return;
    const enemyIdx = s.grid.indexOf(enemyCard);
    const s2 = reducer(s, { type: "flip", idx: enemyIdx });
    expect(s2.playerHp).toBeLessThan(40);
  });

  it("gold card increases gold", () => {
    const s = initialState(1);
    const goldCard = s.grid.find(c => c.kind === "gold");
    if (!goldCard) return;
    const goldIdx = s.grid.indexOf(goldCard);
    const s2 = reducer(s, { type: "flip", idx: goldIdx });
    expect(s2.gold).toBeGreaterThan(0);
  });

  it("isTerminal null during play", () => {
    expect(isTerminal(initialState(1))).toBeNull();
  });

  it("isTerminal returns score when cleared", () => {
    const s = { ...initialState(1), phase: "cleared" as const, score: 80, gold: 20 };
    const r = isTerminal(s);
    expect(r).not.toBeNull();
    expect(r!.score).toBe(80);
  });
});

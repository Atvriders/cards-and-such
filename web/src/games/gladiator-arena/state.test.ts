import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { GladiatorArenaSettings } from "./state.js";

const normal: GladiatorArenaSettings = { difficulty: "normal" };
const easy: GladiatorArenaSettings = { difficulty: "easy" };

describe("GladiatorArena initialState", () => {
  it("player starts with 50 HP", () => {
    const s = initialState(1, normal);
    expect(s.player.hp).toBe(50);
    expect(s.player.maxHp).toBe(50);
  });

  it("starts at round 1, not game over", () => {
    const s = initialState(1, normal);
    expect(s.round).toBe(1);
    expect(s.gameOver).toBe(false);
  });

  it("opponent is generated with HP > 0", () => {
    const s = initialState(1, normal);
    expect(s.opponent.hp).toBeGreaterThan(0);
    expect(s.opponent.name.length).toBeGreaterThan(0);
  });
});

describe("GladiatorArena reducer", () => {
  it("strike reduces opponent HP", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "strike" });
    expect(s2.opponent.hp).toBeLessThan(s.opponent.hp);
  });

  it("powerStrike reduces opponent HP more than strike on average", () => {
    const s = initialState(42, easy);
    const s2 = reducer(s, { type: "powerStrike" });
    const s3 = reducer(s, { type: "strike" });
    expect(s2.opponent.hp).toBeLessThanOrEqual(s3.opponent.hp);
  });

  it("defend reduces damage taken", () => {
    const s = initialState(1, normal);
    const sStrike = reducer(s, { type: "strike" });
    const sDefend = reducer(s, { type: "defend" });
    // After defend, player hp should be >= after strike (less damage taken)
    expect(sDefend.player.hp).toBeGreaterThanOrEqual(sStrike.player.hp);
  });

  it("actionUsed blocks further actions in same round", () => {
    const s = initialState(1, normal);
    const s2 = reducer(s, { type: "strike" });
    expect(s2.actionUsed).toBe(true);
    const s3 = reducer(s2, { type: "strike" });
    expect(s3.opponent.hp).toBe(s2.opponent.hp); // no change
  });

  it("restart resets to fresh state", () => {
    const s = initialState(1, normal);
    const s2 = reducer(s, { type: "strike" });
    const s3 = reducer(s2, { type: "restart" });
    expect(s3.round).toBe(1);
    expect(s3.player.hp).toBe(50);
    expect(s3.gameOver).toBe(false);
  });
});

describe("GladiatorArena isTerminal", () => {
  it("returns null when game is ongoing", () => {
    expect(isTerminal(initialState(1, normal))).toBeNull();
  });

  it("returns score 0 on first-round loss", () => {
    const s = { ...initialState(1, normal), gameOver: true, round: 1 };
    expect(isTerminal(s)?.score).toBe(0);
  });

  it("returns score 40 after 2 victories (round 3)", () => {
    const s = { ...initialState(1, normal), gameOver: true, round: 3 };
    expect(isTerminal(s)?.score).toBe(40);
  });
});

import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { AlienCardBattleSettings } from "./state.js";

const s5: AlienCardBattleSettings = { rounds: "5" };
const s7: AlienCardBattleSettings = { rounds: "7" };

describe("AlienCardBattle initialState", () => {
  it("player has 4 cards in hand", () => {
    const s = initialState(1, s7);
    expect(s.playerHand).toHaveLength(4);
  });

  it("starts at round 1, scores 0–0", () => {
    const s = initialState(1, s7);
    expect(s.roundNum).toBe(1);
    expect(s.playerScore).toBe(0);
    expect(s.opponentScore).toBe(0);
  });

  it("total rounds matches setting", () => {
    expect(initialState(1, s5).totalRounds).toBe(5);
    expect(initialState(1, s7).totalRounds).toBe(7);
  });
});

describe("AlienCardBattle reducer", () => {
  it("select sets selectedIdx", () => {
    const s = initialState(1, s7);
    const s2 = reducer(s, { type: "select", idx: 1 });
    expect(s2.selectedIdx).toBe(1);
  });

  it("play without selection is no-op", () => {
    const s = initialState(1, s7);
    expect(reducer(s, { type: "play" }).roundNum).toBe(1);
  });

  it("play advances round and records result", () => {
    let s = initialState(1, s7);
    s = reducer(s, { type: "select", idx: 0 });
    s = reducer(s, { type: "play" });
    expect(s.roundNum).toBe(2);
    expect(s.roundResult.length).toBeGreaterThan(0);
  });

  it("game ends after totalRounds", () => {
    let s = initialState(1, s5);
    for (let i = 0; i < 5; i++) {
      s = reducer(s, { type: "select", idx: 0 });
      s = reducer(s, { type: "play" });
    }
    expect(s.gameOver).toBe(true);
  });

  it("restart resets to fresh state", () => {
    let s = initialState(1, s5);
    s = reducer(s, { type: "select", idx: 0 });
    s = reducer(s, { type: "play" });
    s = reducer(s, { type: "restart" });
    expect(s.roundNum).toBe(1);
    expect(s.playerScore).toBe(0);
    expect(s.gameOver).toBe(false);
  });
});

describe("AlienCardBattle isTerminal", () => {
  it("returns null when active", () => {
    expect(isTerminal(initialState(1, s7))).toBeNull();
  });

  it("returns 100 when player wins all rounds", () => {
    const s = { ...initialState(1, s7), gameOver: true, playerScore: 7, opponentScore: 0 };
    expect(isTerminal(s)?.score).toBe(100);
  });

  it("returns 0 when player wins no rounds", () => {
    const s = { ...initialState(1, s7), gameOver: true, playerScore: 0, opponentScore: 7 };
    expect(isTerminal(s)?.score).toBe(0);
  });
});

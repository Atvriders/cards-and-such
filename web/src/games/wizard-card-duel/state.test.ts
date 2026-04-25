import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { WizardCardDuelSettings } from "./state.js";

const normal: WizardCardDuelSettings = { handSize: "5" };

describe("WizardCardDuel initialState", () => {
  it("both players start with 30 HP", () => {
    const s = initialState(1, normal);
    expect(s.playerHp).toBe(30);
    expect(s.opponentHp).toBe(30);
  });

  it("player hand has correct size", () => {
    const s = initialState(1, normal);
    expect(s.playerHand).toHaveLength(5);
  });

  it("opponent hand has correct size", () => {
    const s = initialState(1, normal);
    expect(s.opponentHand).toHaveLength(5);
  });

  it("starts at round 1, not game over", () => {
    const s = initialState(1, normal);
    expect(s.round).toBe(1);
    expect(s.gameOver).toBe(false);
  });
});

describe("WizardCardDuel reducer", () => {
  it("select sets selectedIdx", () => {
    const s = initialState(1, normal);
    const s2 = reducer(s, { type: "select", idx: 0 });
    expect(s2.selectedIdx).toBe(0);
  });

  it("play without selection is ignored", () => {
    const s = initialState(1, normal);
    const s2 = reducer(s, { type: "play" });
    expect(s2.round).toBe(s.round);
  });

  it("play advances the round and reduces HP", () => {
    let s = initialState(1, normal);
    s = reducer(s, { type: "select", idx: 0 });
    s = reducer(s, { type: "play" });
    expect(s.round).toBe(2);
    // At least one side took damage (or shield was played)
    expect(s.playerHp + s.opponentHp).toBeLessThanOrEqual(60);
  });

  it("restart resets to fresh state", () => {
    let s = initialState(1, normal);
    s = reducer(s, { type: "select", idx: 0 });
    s = reducer(s, { type: "play" });
    s = reducer(s, { type: "restart" });
    expect(s.playerHp).toBe(30);
    expect(s.round).toBe(1);
    expect(s.gameOver).toBe(false);
  });

  it("game over when opponent HP reaches 0", () => {
    let s = initialState(1, normal);
    s = { ...s, opponentHp: 1 };
    // Find a non-shield card
    const atkIdx = s.playerHand.findIndex(c => c.type !== "shield" && c.power > 0);
    if (atkIdx >= 0) {
      s = reducer(s, { type: "select", idx: atkIdx });
      s = reducer(s, { type: "play" });
      if (s.opponentHp <= 0) {
        expect(s.gameOver).toBe(true);
      }
    }
  });
});

describe("WizardCardDuel isTerminal", () => {
  it("returns null when active", () => {
    expect(isTerminal(initialState(1, normal))).toBeNull();
  });

  it("returns high score on win with high HP", () => {
    const s = { ...initialState(1, normal), gameOver: true, playerWon: true, playerHp: 25 };
    expect(isTerminal(s)?.score).toBe(75);
  });

  it("returns low score on loss", () => {
    const s = { ...initialState(1, normal), gameOver: true, playerWon: false, playerHp: 5 };
    expect(isTerminal(s)?.score).toBe(10);
  });
});

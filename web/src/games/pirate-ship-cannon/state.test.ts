import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { PirateShipCannonSettings } from "./state.js";

const s5: PirateShipCannonSettings = { rounds: "5" };
const s8: PirateShipCannonSettings = { rounds: "8" };

describe("PirateShipCannon initialState", () => {
  it("sets totalRounds to 5", () => {
    expect(initialState(1, s5).totalRounds).toBe(5);
  });

  it("sets totalRounds to 8", () => {
    expect(initialState(1, s8).totalRounds).toBe(8);
  });

  it("starts at round 1", () => {
    expect(initialState(1, s5).round).toBe(1);
  });

  it("starts with 0 score", () => {
    expect(initialState(1, s5).score).toBe(0);
  });

  it("not game over initially", () => {
    expect(initialState(1, s5).gameOver).toBe(false);
  });
});

describe("PirateShipCannon reducer", () => {
  it("aimLeft decreases angle", () => {
    const s = initialState(1, s5);
    const s2 = reducer(s, { type: "aimLeft" });
    expect(s2.cannonAngle).toBe(s.cannonAngle - 1);
  });

  it("aimRight increases angle", () => {
    const s = initialState(1, s5);
    const s2 = reducer(s, { type: "aimRight" });
    expect(s2.cannonAngle).toBe(s.cannonAngle + 1);
  });

  it("powerUp increases power by 5", () => {
    const s = initialState(1, s5);
    const s2 = reducer(s, { type: "powerUp" });
    expect(s2.cannonPower).toBe(s.cannonPower + 5);
  });

  it("powerDown decreases power by 5", () => {
    const s = initialState(1, s5);
    const s2 = reducer(s, { type: "powerDown" });
    expect(s2.cannonPower).toBe(s.cannonPower - 5);
  });

  it("fire advances round", () => {
    const s = initialState(1, s5);
    const s2 = reducer(s, { type: "fire" });
    expect(s2.round).toBe(2);
  });

  it("game over after all rounds", () => {
    let s = initialState(1, s5);
    for (let i = 0; i < 5; i++) s = reducer(s, { type: "fire" });
    expect(s.gameOver).toBe(true);
  });

  it("direct hit scores 150", () => {
    const s = initialState(1, s5);
    // Force enemy at known position for direct hit
    const enemy = { distance: 50, speed: 1, position: 0, sunk: false };
    const modified = { ...s, enemy, cannonPower: 50, cannonAngle: 0 };
    const s2 = reducer(modified, { type: "fire" });
    expect(s2.score).toBe(150);
    expect(s2.lastResult).toBe("direct");
  });

  it("restart resets state", () => {
    let s = initialState(1, s5);
    for (let i = 0; i < 3; i++) s = reducer(s, { type: "fire" });
    s = reducer(s, { type: "restart" });
    expect(s.round).toBe(1);
    expect(s.score).toBe(0);
  });

  it("isTerminal returns null when not over", () => {
    expect(isTerminal(initialState(1, s5))).toBeNull();
  });

  it("isTerminal caps at 1000", () => {
    const s = { ...initialState(1, s5), gameOver: true, score: 9999 };
    expect(isTerminal(s)!.score).toBe(1000);
  });
});

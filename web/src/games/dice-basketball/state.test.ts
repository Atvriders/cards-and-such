import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { periods: "2" as const };

describe("DiceBasketball initialState", () => {
  it("starts at period 1 with no score", () => {
    const s = initialState(42, defaultSettings);
    expect(s.period).toBe(1);
    expect(s.playerScore).toBe(0);
    expect(s.aiScore).toBe(0);
    expect(s.playerBall).toBe(true);
    expect(s.phase).toBe("play");
  });

  it("4-period game has totalPeriods 4", () => {
    const s = initialState(42, { periods: "4" as const });
    expect(s.totalPeriods).toBe(4);
  });

  it("isTerminal returns null at start", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });

  it("lastPlay has tip-off message", () => {
    const s = initialState(42, defaultSettings);
    expect(s.lastPlay).toContain("Tip-off");
  });
});

describe("DiceBasketball reducer", () => {
  it("shoot layup produces a result", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "shoot", shotType: "layup" });
    expect(typeof s2.playerScore).toBe("number");
    expect(typeof s2.aiScore).toBe("number");
    expect(s2.lastPlay.length).toBeGreaterThan(0);
  });

  it("shoot three produces a result", () => {
    const s = initialState(99, defaultSettings);
    const s2 = reducer(s, { type: "shoot", shotType: "three" });
    expect(typeof s2.playerScore).toBe("number");
  });

  it("game over phase is no-op", () => {
    const s = { ...initialState(42, defaultSettings), phase: "gameOver" as const };
    const s2 = reducer(s, { type: "shoot", shotType: "layup" });
    expect(s2.phase).toBe("gameOver");
    expect(s2.playerScore).toBe(0);
  });

  it("isTerminal returns score when game over", () => {
    const s = { ...initialState(42, defaultSettings), phase: "gameOver" as const, playerScore: 10, aiScore: 5 };
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBe(1000);
  });
});

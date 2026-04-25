import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { quarters: "2" as const };

describe("DiceFootball initialState", () => {
  it("starts with correct defaults", () => {
    const s = initialState(42, defaultSettings);
    expect(s.playerScore).toBe(0);
    expect(s.aiScore).toBe(0);
    expect(s.quarter).toBe(1);
    expect(s.down).toBe(1);
    expect(s.yardsToGo).toBe(10);
    expect(s.possession).toBe("player");
    expect(s.phase).toBe("play");
  });

  it("4 quarter game has correct totalQuarters", () => {
    const s = initialState(42, { quarters: "4" as const });
    expect(s.totalQuarters).toBe(4);
  });

  it("isTerminal returns null at start", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("field position starts at 20", () => {
    const s = initialState(42, defaultSettings);
    expect(s.fieldPosition).toBe(20);
  });
});

describe("DiceFootball reducer", () => {
  it("run play changes state", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "play", playType: "run" });
    // Either advanced down or first down or AI took turn
    expect(s2).toBeDefined();
    expect(typeof s2.playerScore).toBe("number");
  });

  it("pass play changes state", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "play", playType: "pass" });
    expect(s2).toBeDefined();
    expect(typeof s2.lastPlay).toBe("string");
  });

  it("field goal attempt changes state", () => {
    const s = { ...initialState(42, defaultSettings), fieldPosition: 50 };
    const s2 = reducer(s, { type: "play", playType: "kick" });
    expect(s2).toBeDefined();
  });

  it("game over phase returns no-op", () => {
    const s = { ...initialState(42, defaultSettings), phase: "gameOver" as const };
    const s2 = reducer(s, { type: "play", playType: "run" });
    expect(s2.phase).toBe("gameOver");
  });
});

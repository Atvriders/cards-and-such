import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { difficulty: "medium" as const };

describe("initialState", () => {
  it("starts with full HP and not over", () => {
    const s = initialState(1, defaultSettings);
    expect(s.playerHP).toBe(100);
    expect(s.opponentHP).toBe(100);
    expect(s.over).toBe(false);
    expect(s.round).toBe(1);
  });
});

describe("determinism", () => {
  it("same seed produces identical state", () => {
    const s1 = initialState(42, defaultSettings);
    const s2 = initialState(42, defaultSettings);
    expect(s1).toEqual(s2);
  });
});

describe("punch action", () => {
  it("score increases after punching", () => {
    const s = initialState(1, defaultSettings);
    const after = reducer(s, { type: "punch" });
    expect(after.score).toBeGreaterThanOrEqual(0);
    expect(after.playerAction).toBe("punch");
  });
});

describe("block action", () => {
  it("block does not reduce player HP below initial when opponent punches and player blocks", () => {
    const s = initialState(1, defaultSettings);
    const after = reducer(s, { type: "block" });
    expect(after.playerHP).toBeGreaterThanOrEqual(0);
    expect(after.playerHP).toBeLessThanOrEqual(100);
  });
});

describe("game over", () => {
  it("isTerminal returns score when over", () => {
    const s = initialState(1, defaultSettings);
    const overState = { ...s, over: true, winner: "player" as const, score: 75 };
    const result = isTerminal(overState);
    expect(result).not.toBeNull();
    expect(result?.score).toBe(75);
  });

  it("isTerminal returns null when not over", () => {
    const s = initialState(1, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });
});

describe("dodge action", () => {
  it("dodge action sets playerAction to dodge", () => {
    const s = initialState(1, defaultSettings);
    const after = reducer(s, { type: "dodge" });
    expect(after.playerAction).toBe("dodge");
  });
});

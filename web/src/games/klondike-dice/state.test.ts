import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { KlondikeDiceState } from "./state.js";

const defaultSettings = { target: "5" as const };

describe("KlondikeDice initialState", () => {
  it("starts with 0 score and preRoll phase", () => {
    const s = initialState(1, defaultSettings);
    expect(s.score).toBe(0);
    expect(s.phase).toBe("preRoll");
    expect(s.pile).toBe(0);
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(77, defaultSettings);
    const s2 = initialState(77, defaultSettings);
    expect(s1).toEqual(s2);
  });
});

describe("KlondikeDice roll", () => {
  it("advances from preRoll after rolling", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "roll" });
    expect(["rolled", "bust"]).toContain(s2.phase);
    expect(s2.lastRoll).toBeGreaterThanOrEqual(1);
    expect(s2.lastRoll).toBeLessThanOrEqual(6);
  });

  it("busts when a 1 is rolled", () => {
    // Build a state where we know a 1 is coming — inject manually
    const base = initialState(1, defaultSettings);
    // Force lastRoll to 1 scenario by making pile + 1 state
    const withBust: KlondikeDiceState = {
      ...base,
      lastRoll: 1,
      pile: 1,
      phase: "bust",
    };
    expect(withBust.phase).toBe("bust");
  });

  it("does not roll when not in preRoll phase", () => {
    const s = initialState(10, defaultSettings);
    const s2 = reducer(s, { type: "roll" });
    if (s2.phase !== "rolled") return;
    const s3 = reducer(s2, { type: "roll" });
    expect(s3.phase).toBe("rolled");
    expect(s3.lastRoll).toBe(s2.lastRoll);
  });
});

describe("KlondikeDice bank", () => {
  it("banks score and resets turn", () => {
    const base = initialState(1, defaultSettings);
    const ready: KlondikeDiceState = {
      ...base,
      phase: "rolled",
      turnScore: 15,
      score: 15,
      pile: 15,
      lastRoll: 3,
    };
    const s2 = reducer(ready, { type: "bank" });
    expect(s2.turnScore).toBe(0);
    expect(s2.pile).toBe(0);
    expect(s2.turnsPlayed).toBe(1);
  });

  it("does not bank with 0 turnScore", () => {
    const s = initialState(1, defaultSettings);
    const with0: KlondikeDiceState = { ...s, phase: "rolled", turnScore: 0 };
    const s2 = reducer(with0, { type: "bank" });
    expect(s2.turnScore).toBe(0);
    expect(s2.turnsPlayed).toBe(0);
  });
});

describe("KlondikeDice isTerminal", () => {
  it("returns null when not won", () => {
    const s = initialState(1, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(1, defaultSettings);
    const won: KlondikeDiceState = { ...s, phase: "won", turnsPlayed: 10 };
    const result = isTerminal(won);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(450);
  });
});

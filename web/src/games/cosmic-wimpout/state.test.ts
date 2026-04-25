import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, scoreDice, hasScoring } from "./state.js";
import type { CosmicWimpoutState } from "./state.js";

const defaultSettings = { target: "100" as const };

describe("CosmicWimpout scoreDice", () => {
  it("scores single 1s at 10 each", () => {
    expect(scoreDice([1])).toBe(10);
    expect(scoreDice([1, 1])).toBe(20);
  });

  it("scores single 5s at 5 each", () => {
    expect(scoreDice([5])).toBe(5);
    expect(scoreDice([5, 5])).toBe(10);
  });

  it("scores triple of non-1 as face*10", () => {
    expect(scoreDice([3, 3, 3])).toBe(30);
    expect(scoreDice([6, 6, 6])).toBe(60);
  });

  it("scores triple of 1 as 100", () => {
    expect(scoreDice([1, 1, 1])).toBe(100);
  });
});

describe("CosmicWimpout hasScoring", () => {
  it("returns true if 1 present", () => {
    expect(hasScoring([1, 2, 3, 4, 6])).toBe(true);
  });

  it("returns false for no scoring dice", () => {
    expect(hasScoring([2, 3, 4, 6, 6])).toBe(false);
  });

  it("returns true for triple", () => {
    expect(hasScoring([2, 2, 2, 3, 4])).toBe(true);
  });
});

describe("CosmicWimpout initialState", () => {
  it("starts at 0 banked and preRoll", () => {
    const s = initialState(1, defaultSettings);
    expect(s.bankedScore).toBe(0);
    expect(s.phase).toBe("preRoll");
    expect(s.keptIndices).toHaveLength(0);
  });
});

describe("CosmicWimpout roll", () => {
  it("produces 5 dice after first roll", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "roll" });
    expect(["rolled", "wimpout"]).toContain(s2.phase);
    expect(s2.lastRoll).toHaveLength(5);
  });

  it("wimpout triggers when no scoring dice", () => {
    const base = initialState(1, defaultSettings);
    const wimpState: CosmicWimpoutState = {
      ...base,
      lastRoll: [2, 3, 4, 6, 6],
      phase: "wimpout",
    };
    expect(wimpState.phase).toBe("wimpout");
    // nextTurn should reset
    const s2 = reducer(wimpState, { type: "nextTurn" });
    expect(s2.phase).toBe("preRoll");
    expect(s2.keptIndices).toHaveLength(0);
  });
});

describe("CosmicWimpout isTerminal", () => {
  it("returns null when not won", () => {
    const s = initialState(1, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when won", () => {
    const base = initialState(1, defaultSettings);
    const won: CosmicWimpoutState = { ...base, phase: "won", turnsPlayed: 5 };
    const result = isTerminal(won);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(950);
  });
});

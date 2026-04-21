import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, evaluateReels, resultDescription } from "./state.js";
import type { SlotsState, SlotSymbol } from "./state.js";

const defaultSettings = { betSize: "5" as const, maxSpins: "50" as const };

function reels(a: SlotSymbol, b: SlotSymbol, c: SlotSymbol): [SlotSymbol, SlotSymbol, SlotSymbol] {
  return [a, b, c];
}

describe("evaluateReels", () => {
  it("three sevens pays 100x bet", () => {
    expect(evaluateReels(reels("seven", "seven", "seven"), 5)).toBe(500);
  });

  it("three bars pays 25x bet", () => {
    expect(evaluateReels(reels("bar", "bar", "bar"), 5)).toBe(125);
  });

  it("three bells pays 10x bet", () => {
    expect(evaluateReels(reels("bell", "bell", "bell"), 5)).toBe(50);
  });

  it("three cherries pays 5x bet", () => {
    expect(evaluateReels(reels("cherry", "cherry", "cherry"), 5)).toBe(25);
  });

  it("three lemons/oranges/plums pays 2x bet", () => {
    expect(evaluateReels(reels("lemon", "lemon", "lemon"), 5)).toBe(10);
    expect(evaluateReels(reels("orange", "orange", "orange"), 5)).toBe(10);
    expect(evaluateReels(reels("plum", "plum", "plum"), 5)).toBe(10);
  });

  it("two cherries pays 1x bet", () => {
    expect(evaluateReels(reels("cherry", "cherry", "lemon"), 5)).toBe(5);
    expect(evaluateReels(reels("cherry", "lemon", "cherry"), 5)).toBe(5);
    expect(evaluateReels(reels("lemon", "cherry", "cherry"), 5)).toBe(5);
  });

  it("no match returns 0", () => {
    expect(evaluateReels(reels("lemon", "orange", "plum"), 5)).toBe(0);
    expect(evaluateReels(reels("cherry", "lemon", "plum"), 5)).toBe(0);
  });
});

describe("resultDescription", () => {
  it("describes jackpot", () => {
    const desc = resultDescription(reels("seven", "seven", "seven"), 5);
    expect(desc).toContain("777");
    expect(desc).toContain("500");
  });

  it("describes no win", () => {
    const desc = resultDescription(reels("lemon", "orange", "plum"), 5);
    expect(desc).toContain("No win");
  });
});

describe("initialState", () => {
  it("starts with 100 credits", () => {
    const s = initialState(42, defaultSettings);
    expect(s.credits).toBe(100);
    expect(s.spinsPlayed).toBe(0);
    expect(s.phase).toBe("idle");
    expect(s.reels).toBeNull();
  });
});

describe("spin action", () => {
  it("deducts bet and shows reels", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "spin" });
    expect(s2.spinsPlayed).toBe(1);
    expect(s2.reels).not.toBeNull();
    expect(s2.reels).toHaveLength(3);
    expect(s2.phase).toBe("result");
    // Credits either up (win) or down by bet (no win)
    expect(s2.credits).toBeLessThanOrEqual(100); // at most stayed same (1x win)
  });

  it("cannot spin when out of credits", () => {
    const s = initialState(42, defaultSettings);
    const broke: SlotsState = { ...s, credits: 0 };
    const s2 = reducer(broke, { type: "spin" });
    expect(s2.spinsPlayed).toBe(0); // unchanged
  });

  it("cannot spin when max spins reached", () => {
    const s = initialState(42, defaultSettings);
    const maxed: SlotsState = { ...s, spinsPlayed: 50 };
    const s2 = reducer(maxed, { type: "spin" });
    expect(s2.spinsPlayed).toBe(50); // unchanged
  });

  it("applies win payout correctly", () => {
    // Find a winning spin by searching seeds
    let foundWin = false;
    for (let seed = 0; seed < 500; seed++) {
      const s = initialState(seed, defaultSettings);
      const s2 = reducer(s, { type: "spin" });
      if (s2.credits > 100) {
        foundWin = true;
        break;
      }
    }
    expect(foundWin).toBe(true);
  });
});

describe("isTerminal", () => {
  it("not terminal at start", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });

  it("terminal when maxSpins reached", () => {
    const s = initialState(42, defaultSettings);
    const done: SlotsState = { ...s, phase: "result", spinsPlayed: 50, credits: 80 };
    expect(isTerminal(done)).toEqual({ score: 80 });
  });

  it("terminal when out of credits", () => {
    const s = initialState(42, defaultSettings);
    const broke: SlotsState = { ...s, phase: "result", spinsPlayed: 10, credits: 3 };
    // Can't afford bet of 5
    expect(isTerminal(broke)).toEqual({ score: 3 });
  });
});

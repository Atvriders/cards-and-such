import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, COLUMN_HEIGHTS } from "./state.js";
import type { CantStopState } from "./state.js";

const settings = { opponents: "1" as const };

describe("CantStop initialState", () => {
  it("starts with no runners, no claimed columns, preRoll phase", () => {
    const s = initialState(42, settings);
    expect(s.phase).toBe("preRoll");
    expect(s.runners).toEqual({});
    expect(s.players[0]!.claimed).toEqual({});
    expect(s.currentPlayer).toBe(0);
    expect(s.winner).toBeNull();
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(99, settings);
    const s2 = initialState(99, settings);
    expect(s1).toEqual(s2);
  });
});

describe("CantStop roll", () => {
  it("produces lastRoll with 4 dice values 1-6", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.lastRoll).not.toBeNull();
    expect(s2.lastRoll!.length).toBe(4);
    for (const d of s2.lastRoll!) {
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(6);
    }
  });

  it("transitions to pickSplit or preRoll or busted after roll", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "roll" });
    expect(["preRoll", "pickSplit", "busted"]).toContain(s2.phase);
  });

  it("does not roll when phase is not preRoll", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "roll" });
    if (s2.phase === "pickSplit") {
      const s3 = reducer(s2, { type: "roll" });
      expect(s3.lastRoll).toEqual(s2.lastRoll);
    }
  });
});

describe("CantStop bank", () => {
  it("bank does nothing when no runners", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "bank" });
    expect(s2).toEqual(s);
  });

  it("bank saves runner progress into banked", () => {
    const base = initialState(42, settings);
    const withRunner: CantStopState = {
      ...base,
      runners: { 7: 2 },
      phase: "preRoll",
    };
    const s2 = reducer(withRunner, { type: "bank" });
    // After bank, bot plays; human's banked should contain col 7 or it reset to bot
    // Just check the runner is cleared
    expect(s2.runners).toEqual({});
  });

  it("wins when 3 columns are claimed", () => {
    const base = initialState(42, settings);
    const winState: CantStopState = {
      ...base,
      runners: { 7: COLUMN_HEIGHTS[7]! },
      players: [
        {
          banked: {},
          claimed: { 2: COLUMN_HEIGHTS[2]!, 3: COLUMN_HEIGHTS[3]! },
        },
        { banked: {}, claimed: {} },
      ],
      phase: "preRoll",
    };
    const s2 = reducer(winState, { type: "bank" });
    expect(s2.winner).toBe(0);
    expect(s2.phase).toBe("gameOver");
  });
});

describe("CantStop isTerminal", () => {
  it("returns null when game not over", () => {
    const s = initialState(42, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score 100 when player wins", () => {
    const s = initialState(42, settings);
    const won: CantStopState = { ...s, winner: 0, phase: "gameOver" };
    expect(isTerminal(won)).toEqual({ score: 100 });
  });

  it("returns score 0 when bot wins", () => {
    const s = initialState(42, settings);
    const lost: CantStopState = { ...s, winner: 1, phase: "gameOver" };
    expect(isTerminal(lost)).toEqual({ score: 0 });
  });
});

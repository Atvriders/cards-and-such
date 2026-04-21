import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings = {
  target: "10000" as const,
  startingBuy: "0" as const,
  botStrategy: "normal" as const,
};

describe("TenThousand initialState", () => {
  it("starts with preRoll phase and 0 score", () => {
    const s = initialState(42, settings);
    expect(s.currentTurn.phase).toBe("preRoll");
    expect(s.bankedScore).toBe(0);
    expect(s.currentTurn.diceRemaining).toBe(6);
  });

  it("is deterministic", () => {
    expect(initialState(7, settings)).toEqual(initialState(7, settings));
  });
});

describe("TenThousand roll action", () => {
  it("rolls dice and detects farkle or scoring", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "roll" });
    expect(["rolled", "farkled"]).toContain(s2.currentTurn.phase);
    expect(s2.lastRoll.length).toBe(6);
  });

  it("is deterministic", () => {
    const s = initialState(42, settings);
    const s2a = reducer(s, { type: "roll" });
    const s2b = reducer(s, { type: "roll" });
    expect(s2a.lastRoll).toEqual(s2b.lastRoll);
  });
});

describe("TenThousand setAside action", () => {
  it("sets aside scoring dice and reduces remaining", () => {
    let s = initialState(42, settings);
    s = reducer(s, { type: "roll" });
    if (s.currentTurn.phase !== "rolled") return; // skip if farkle

    // Find a scoring die (value 1 or 5)
    const scoringIndex = s.lastRoll.findIndex((d) => d.value === 1 || d.value === 5);
    if (scoringIndex >= 0) {
      const s2 = reducer(s, { type: "setAside", indices: [scoringIndex] });
      expect(s2.currentTurn.turnScore).toBeGreaterThan(0);
    }
  });

  it("rejects invalid (non-scoring) set-aside", () => {
    let s = initialState(42, settings);
    s = reducer(s, { type: "roll" });
    if (s.currentTurn.phase !== "rolled") return;

    // Try to set aside dice with value 2 (not scoring alone)
    const twoIndex = s.lastRoll.findIndex((d) => d.value === 2);
    if (twoIndex >= 0) {
      const s2 = reducer(s, { type: "setAside", indices: [twoIndex] });
      expect(s2.currentTurn.turnScore).toBe(s.currentTurn.turnScore);
    }
  });
});

describe("TenThousand bank action", () => {
  it("banking after scoring increases bankedScore", () => {
    let s = initialState(42, settings);
    // Manually set a turn score
    s = { ...s, currentTurn: { ...s.currentTurn, turnScore: 300, phase: "preRoll" } };
    const s2 = reducer(s, { type: "bank" });
    expect(s2.bankedScore).toBe(300);
    expect(s2.turnsTaken).toBe(1);
  });

  it("cannot bank with 0 turn score", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "bank" });
    expect(s2.bankedScore).toBe(0);
  });
});

describe("TenThousand nextTurn after farkle", () => {
  it("advances turn after farkle", () => {
    let s = initialState(42, settings);
    // Force farkle state
    s = { ...s, currentTurn: { ...s.currentTurn, phase: "farkled" } };
    const s2 = reducer(s, { type: "nextTurn" });
    expect(s2.currentTurn.phase).toBe("preRoll");
    expect(s2.turnsTaken).toBe(1);
  });
});

describe("TenThousand isTerminal", () => {
  it("returns null while game ongoing", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(42, settings);
    const wonState = { ...s, won: true, playerWon: true, bankedScore: 10000, turnsTaken: 20 };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result?.score).toBeGreaterThan(0);
  });
});

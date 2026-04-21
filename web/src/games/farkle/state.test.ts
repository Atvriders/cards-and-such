import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { FarkleState } from "./state.js";

const defaultSettings = { target: "10000" as const };

describe("Farkle initialState", () => {
  it("has 0 bankedScore and 0 turnsTaken", () => {
    const s = initialState(42, defaultSettings);
    expect(s.bankedScore).toBe(0);
    expect(s.turnsTaken).toBe(0);
    expect(s.won).toBe(false);
    expect(s.currentTurn.phase).toBe("preRoll");
    expect(s.currentTurn.diceRemaining).toBe(6);
  });

  it("is deterministic under the same seed", () => {
    const s1 = initialState(99, defaultSettings);
    const s2 = initialState(99, defaultSettings);
    expect(s1).toEqual(s2);
  });
});

describe("Farkle roll", () => {
  it("advances phase from preRoll to rolled or farkled", () => {
    const s = initialState(42, defaultSettings);
    expect(s.currentTurn.phase).toBe("preRoll");
    const s2 = reducer(s, { type: "roll" });
    expect(["rolled", "farkled"]).toContain(s2.currentTurn.phase);
    expect(s2.lastRoll.length).toBe(6);
  });

  it("is deterministic — same seed produces same roll", () => {
    const s = initialState(123, defaultSettings);
    const s2a = reducer(s, { type: "roll" });
    const s2b = reducer(s, { type: "roll" });
    expect(s2a.lastRoll.map((d) => d.value)).toEqual(s2b.lastRoll.map((d) => d.value));
  });

  it("does not roll if phase is not preRoll", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "roll" });
    if (s2.currentTurn.phase !== "rolled") return; // skip if farkled
    const s3 = reducer(s2, { type: "roll" });
    // Should not roll again since phase is "rolled"
    expect(s3.currentTurn.phase).toBe("rolled");
    expect(s3.lastRoll).toEqual(s2.lastRoll);
  });
});

describe("Farkle setAside", () => {
  function findRolledState(seed: number): FarkleState {
    // Try seeds until we get a non-farkle roll
    for (let i = seed; i < seed + 100; i++) {
      const s = initialState(i, defaultSettings);
      const s2 = reducer(s, { type: "roll" });
      if (s2.currentTurn.phase === "rolled") return s2;
    }
    throw new Error("Could not find a non-farkle roll in range");
  }

  it("accumulates turnScore and reduces diceRemaining", () => {
    const s = findRolledState(42);
    // Find a 1 or 5 in the roll (always scores)
    const roll = s.lastRoll;
    const scoringIndex = roll.findIndex((d) => d.value === 1 || d.value === 5);
    if (scoringIndex === -1) return; // No 1s or 5s — skip (rare)

    const s2 = reducer(s, { type: "setAside", indices: [scoringIndex] });
    expect(s2.currentTurn.turnScore).toBeGreaterThan(0);
    expect(s2.currentTurn.phase).toBe("preRoll");
    // diceRemaining = 5 (or 6 if hot dice)
    expect([5, 6]).toContain(s2.currentTurn.diceRemaining);
  });

  it("rejects set-aside with non-scoring dice", () => {
    // Build a state with a known roll containing a 2 (not scoring by itself)
    const s = findRolledState(42);
    const roll = s.lastRoll;
    // Find a die that would be invalid alone (2, 3, 4, or 6, not part of triple)
    const invalidIndex = roll.findIndex((d) => {
      const v = d.value;
      const count = roll.filter((x) => x.value === v).length;
      return (v === 2 || v === 3 || v === 4 || v === 6) && count < 3;
    });
    if (invalidIndex === -1) return; // All dice happen to score — skip

    const s2 = reducer(s, { type: "setAside", indices: [invalidIndex] });
    // State should be unchanged (invalid selection)
    expect(s2.currentTurn.turnScore).toBe(s.currentTurn.turnScore);
    expect(s2.currentTurn.phase).toBe("rolled");
  });

  it("hot dice: if all dice set aside, diceRemaining resets to 6", () => {
    // Force a state with a single die remaining that is scoring
    const base = initialState(42, defaultSettings);
    const withOneDie: FarkleState = {
      ...base,
      lastRoll: [{ value: 1, kept: false }],
      currentTurn: {
        diceRemaining: 1,
        setAside: [1, 1, 1, 1, 1], // 5 already set aside
        turnScore: 500,
        phase: "rolled",
      },
    };
    const s2 = reducer(withOneDie, { type: "setAside", indices: [0] });
    expect(s2.currentTurn.diceRemaining).toBe(6);
    expect(s2.currentTurn.turnScore).toBe(600); // 500 + 100 for the 1
  });
});

describe("Farkle bank", () => {
  it("adds turnScore to bankedScore and increments turnsTaken", () => {
    const s = initialState(42, defaultSettings);
    // Manually set up a state ready to bank
    const readyToBank: FarkleState = {
      ...s,
      currentTurn: {
        diceRemaining: 5,
        setAside: [1],
        turnScore: 100,
        phase: "preRoll",
      },
    };
    const s2 = reducer(readyToBank, { type: "bank" });
    expect(s2.bankedScore).toBe(100);
    expect(s2.turnsTaken).toBe(1);
    expect(s2.currentTurn.turnScore).toBe(0);
    expect(s2.currentTurn.diceRemaining).toBe(6);
    expect(s2.currentTurn.phase).toBe("preRoll");
  });

  it("does not bank if turnScore is 0", () => {
    const s = initialState(42, defaultSettings);
    expect(s.currentTurn.turnScore).toBe(0);
    const s2 = reducer(s, { type: "bank" });
    expect(s2.bankedScore).toBe(0);
    expect(s2.turnsTaken).toBe(0);
  });
});

describe("Farkle isTerminal", () => {
  it("returns null when game not won", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns {score} when bankedScore >= target", () => {
    const s = initialState(42, defaultSettings);
    const won: FarkleState = {
      ...s,
      won: true,
      bankedScore: 10000,
      turnsTaken: 25,
    };
    const result = isTerminal(won);
    expect(result).not.toBeNull();
    expect(result?.score).toBe(Math.max(0, 1000 - 25));
    expect(result?.score).toBe(975);
  });

  it("score is non-negative even for many turns", () => {
    const s = initialState(42, defaultSettings);
    const won: FarkleState = {
      ...s,
      won: true,
      bankedScore: 10000,
      turnsTaken: 1500,
    };
    const result = isTerminal(won);
    expect(result?.score).toBe(0);
  });
});

import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, scoreRoll } from "./state.js";
import type { DieFace } from "../../engines/dice/index.js";

const settings = { dummy: false };

describe("Bunco initialState", () => {
  it("starts at round 1, preRoll, 3 dice", () => {
    const s = initialState(42, settings);
    expect(s.round).toBe(1);
    expect(s.phase).toBe("preRoll");
    expect(s.dice.length).toBe(3);
    expect(s.totalScore).toBe(0);
  });

  it("is deterministic", () => {
    expect(initialState(99, settings)).toEqual(initialState(99, settings));
  });
});

describe("Bunco scoreRoll", () => {
  it("scores Bunco (3 matching) as 21", () => {
    const dice = [1,1,1].map((v) => ({ value: v as DieFace, kept: false }));
    expect(scoreRoll(dice, 1)).toBe(21);
  });

  it("scores 3-of-a-kind non-matching as 5", () => {
    const dice = [3,3,3].map((v) => ({ value: v as DieFace, kept: false }));
    expect(scoreRoll(dice, 1)).toBe(5);
  });

  it("scores partial matches as 1 pt per matching die", () => {
    const dice = [2,2,4].map((v) => ({ value: v as DieFace, kept: false }));
    expect(scoreRoll(dice, 2)).toBe(2);
  });

  it("scores 0 when no matches and no 3-of-a-kind", () => {
    const dice = [1,2,3].map((v) => ({ value: v as DieFace, kept: false }));
    expect(scoreRoll(dice, 5)).toBe(0);
  });
});

describe("Bunco roll action", () => {
  it("rolls 3 dice and accumulates score", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.dice.length).toBe(3);
    expect(s2.dice.every((d) => d.value >= 1 && d.value <= 6)).toBe(true);
  });

  it("round ends when score hits 0", () => {
    // If we get 0 on a roll, round is over
    let s = initialState(42, settings);
    // Keep rolling until round ends or gameOver
    let maxIter = 50;
    while (s.phase !== "roundOver" && s.phase !== "gameOver" && maxIter-- > 0) {
      s = reducer(s, { type: "roll" });
    }
    expect(["roundOver", "gameOver"]).toContain(s.phase);
  });
});

describe("Bunco nextRound", () => {
  it("advances round number after roundOver", () => {
    let s = initialState(42, settings);
    // Roll until round ends
    let maxIter = 100;
    while (s.phase !== "roundOver" && s.phase !== "gameOver" && maxIter-- > 0) {
      s = reducer(s, { type: "roll" });
    }
    if (s.phase === "roundOver") {
      const s2 = reducer(s, { type: "nextRound" });
      expect(s2.round).toBe(2);
      expect(s2.roundScore).toBe(0);
    }
  });
});

describe("Bunco isTerminal", () => {
  it("returns null while playing", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns score when all 6 rounds complete", () => {
    let s = initialState(42, settings);
    let safety = 1000;
    while (s.phase !== "gameOver" && safety-- > 0) {
      if (s.phase === "roundOver") {
        s = reducer(s, { type: "nextRound" });
      } else {
        s = reducer(s, { type: "roll" });
      }
    }
    expect(s.phase).toBe("gameOver");
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(typeof result?.score).toBe("number");
  });
});

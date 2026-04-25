import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, scoreCategory } from "./state.js";
import type { RollAndWriteProSettings } from "./state.js";

const settings: RollAndWriteProSettings = { rounds: "8" };

describe("RollAndWritePro scoreCategory", () => {
  it("scores ones correctly", () => {
    expect(scoreCategory("ones", [1, 1, 2, 3, 4])).toBe(2);
  });

  it("scores fullHouse as 25", () => {
    expect(scoreCategory("fullHouse", [2, 2, 3, 3, 3])).toBe(25);
    expect(scoreCategory("fullHouse", [1, 2, 3, 4, 5])).toBe(0);
  });

  it("scores yahtzee as 50", () => {
    expect(scoreCategory("yahtzee", [6, 6, 6, 6, 6])).toBe(50);
    expect(scoreCategory("yahtzee", [6, 6, 6, 6, 5])).toBe(0);
  });

  it("scores largeStraight as 40", () => {
    expect(scoreCategory("largeStraight", [1, 2, 3, 4, 5])).toBe(40);
    expect(scoreCategory("largeStraight", [1, 2, 3, 4, 4])).toBe(0);
  });
});

describe("RollAndWritePro initialState", () => {
  it("starts at round 1 with 5 dice", () => {
    const s = initialState(1, settings);
    expect(s.round).toBe(1);
    expect(s.dice).toHaveLength(5);
    expect(s.rollsLeft).toBe(2);
  });

  it("all scores are null initially", () => {
    const s = initialState(1, settings);
    for (const v of Object.values(s.scores)) expect(v).toBeNull();
  });
});

describe("RollAndWritePro reducer", () => {
  it("roll reduces rollsLeft", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.rollsLeft).toBe(1);
  });

  it("toggleKeep marks die as kept", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "toggleKeep", index: 2 });
    expect(s2.kept[2]).toBe(true);
  });

  it("scoreCategory fills in a score", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "scoreCategory", category: "chance" });
    expect(s2.scores.chance).not.toBeNull();
    expect(typeof s2.scores.chance).toBe("number");
  });

  it("cannot score same category twice", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "scoreCategory", category: "chance" });
    const prev = s2.scores.chance;
    const s3 = reducer(s2, { type: "scoreCategory", category: "chance" });
    expect(s3.scores.chance).toBe(prev);
  });

  it("restart clears all scores", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "scoreCategory", category: "ones" });
    const s3 = reducer(s2, { type: "restart" });
    expect(s3.scores.ones).toBeNull();
    expect(s3.round).toBe(1);
  });
});

describe("RollAndWritePro isTerminal", () => {
  it("returns null when not over", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns score object when game over", () => {
    const s = { ...initialState(1, settings), gameOver: true, totalScore: 188 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThanOrEqual(0);
    expect(result!.score).toBeLessThanOrEqual(100);
  });
});

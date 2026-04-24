import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, evaluateHand, HAND_SCORES } from "./state.js";

describe("RollEm", () => {
  it("starts with 5 dice rolled, 2 rolls left, round 1", () => {
    const s = initialState(0, { rounds: "3" });
    expect(s.current.dice).toHaveLength(5);
    expect(s.current.rollsLeft).toBe(2);
    expect(s.round).toBe(1);
    expect(s.gameOver).toBe(false);
    expect(s.totalScore).toBe(0);
    s.current.dice.forEach(d => {
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(6);
    });
  });

  it("toggling a die marks it as kept", () => {
    const s0 = initialState(1, { rounds: "3" });
    const s1 = reducer(s0, { type: "toggleKeep", index: 2 });
    expect(s1.current.kept[2]).toBe(true);
    const s2 = reducer(s1, { type: "toggleKeep", index: 2 });
    expect(s2.current.kept[2]).toBe(false);
  });

  it("rolling rerolls un-kept dice and decrements rollsLeft", () => {
    const s0 = initialState(42, { rounds: "3" });
    const s1 = reducer(s0, { type: "toggleKeep", index: 0 });
    const keptVal = s1.current.dice[0];
    const s2 = reducer(s1, { type: "roll" });
    expect(s2.current.rollsLeft).toBe(1);
    expect(s2.current.dice[0]).toBe(keptVal); // kept die unchanged
  });

  it("endTurn scores hand, plays bot, advances round", () => {
    const s0 = initialState(7, { rounds: "3" });
    const s1 = reducer(s0, { type: "endTurn" });
    expect(s1.history).toHaveLength(1);
    expect(s1.botHistory).toHaveLength(1);
    expect(s1.round).toBe(2);
    expect(s1.totalScore).toBeGreaterThanOrEqual(0);
  });

  it("game ends after all rounds", () => {
    let s = initialState(5, { rounds: "3" });
    for (let i = 0; i < 3; i++) {
      s = reducer(s, { type: "endTurn" });
    }
    expect(s.gameOver).toBe(true);
    expect(s.history).toHaveLength(3);
  });

  it("evaluateHand correctly identifies hands", () => {
    expect(evaluateHand([1,1,1,1,1]).rank).toBe("five-of-a-kind");
    expect(evaluateHand([2,2,2,2,5]).rank).toBe("four-of-a-kind");
    expect(evaluateHand([3,3,3,6,6]).rank).toBe("full-house");
    expect(evaluateHand([1,2,3,4,5]).rank).toBe("straight");
    expect(evaluateHand([4,4,4,1,2]).rank).toBe("three-of-a-kind");
    expect(evaluateHand([5,5,6,6,1]).rank).toBe("two-pair");
    expect(evaluateHand([1,1,2,3,4]).rank).toBe("one-pair");
    expect(evaluateHand([1,2,3,4,6]).rank).toBe("nothing");
  });

  it("isTerminal returns null during play, score at end", () => {
    const s0 = initialState(0, { rounds: "3" });
    expect(isTerminal(s0)).toBeNull();
    let s = s0;
    for (let i = 0; i < 3; i++) s = reducer(s, { type: "endTurn" });
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThanOrEqual(0);
  });

  it("HAND_SCORES are ordered correctly", () => {
    expect(HAND_SCORES["nothing"]).toBe(0);
    expect(HAND_SCORES["five-of-a-kind"]).toBeGreaterThan(HAND_SCORES["four-of-a-kind"]);
    expect(HAND_SCORES["four-of-a-kind"]).toBeGreaterThan(HAND_SCORES["full-house"]);
    expect(HAND_SCORES["full-house"]).toBeGreaterThan(HAND_SCORES["straight"]);
  });
});

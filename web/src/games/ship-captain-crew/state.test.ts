import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, totalScore } from "./state.js";

const settings = { rounds: "3" as const };

describe("ShipCaptainCrew initialState", () => {
  it("starts at round 1, preRoll phase, empty scores", () => {
    const s = initialState(42, settings);
    expect(s.round).toBe(1);
    expect(s.phase).toBe("preRoll");
    expect(s.playerScores).toEqual([]);
    expect(s.botScores).toEqual([]);
    expect(s.gameOver).toBe(false);
  });

  it("is deterministic", () => {
    expect(initialState(7, settings)).toEqual(initialState(7, settings));
  });
});

describe("ShipCaptainCrew roll action", () => {
  it("rolls dice and transitions to rolling phase", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.phase).toBe("rolling");
    expect(s2.current.rollsUsed).toBe(1);
    expect(s2.current.dice.length).toBe(5);
  });

  it("cannot roll more than 3 times without banking", () => {
    let s = initialState(42, settings);
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "roll" });
    expect(s.current.rollsUsed).toBe(3);
    const before = s.current.dice;
    const s2 = reducer(s, { type: "roll" });
    expect(s2.current.dice).toEqual(before);
  });

  it("is deterministic", () => {
    const s = initialState(42, settings);
    const s2a = reducer(s, { type: "roll" });
    const s2b = reducer(s, { type: "roll" });
    expect(s2a.current.dice).toEqual(s2b.current.dice);
  });
});

describe("ShipCaptainCrew bank action", () => {
  it("banking ends the round and triggers bot turn", () => {
    let s = initialState(42, settings);
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "bank" });
    expect(s.phase).toBe("roundOver");
    expect(s.playerScores.length).toBe(1);
    expect(s.botScores.length).toBe(1);
    expect(s.roundResult).not.toBeNull();
  });

  it("cannot bank without rolling", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "bank" });
    expect(s2.phase).toBe("preRoll");
    expect(s2.playerScores.length).toBe(0);
  });

  it("gameOver after max rounds", () => {
    let s = initialState(42, settings);
    for (let i = 0; i < 3; i++) {
      s = reducer(s, { type: "roll" });
      s = reducer(s, { type: "bank" });
      if (!s.gameOver) s = reducer(s, { type: "nextRound" });
    }
    expect(s.gameOver).toBe(true);
    expect(s.playerScores.length).toBe(3);
  });
});

describe("ShipCaptainCrew totalScore / isTerminal", () => {
  it("totalScore sums array", () => {
    expect(totalScore([5, 3, 7])).toBe(15);
  });

  it("isTerminal returns null when not gameOver", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("isTerminal returns score when game is over", () => {
    let s = initialState(42, settings);
    for (let i = 0; i < 3; i++) {
      s = reducer(s, { type: "roll" });
      s = reducer(s, { type: "bank" });
      if (!s.gameOver) s = reducer(s, { type: "nextRound" });
    }
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(typeof result?.score).toBe("number");
  });
});

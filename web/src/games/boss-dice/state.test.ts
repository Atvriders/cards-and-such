import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, processBoss } from "./state.js";
import type { BossDiceState } from "./state.js";
import type { Die, DieFace } from "../../engines/dice/index.js";

const settings = { rounds: "3" as const };

function makeDice(values: number[]): Die[] {
  return values.map((v) => ({ value: v as DieFace, kept: false }));
}

describe("initialState", () => {
  it("starts in preRoll phase with 0 rolls", () => {
    const s = initialState(42, settings);
    expect(s.phase).toBe("preRoll");
    expect(s.current.rollsUsed).toBe(0);
    expect(s.round).toBe(1);
    expect(s.playerScores).toHaveLength(0);
  });
});

describe("processBoss", () => {
  it("locks 6 first, then 5 if present", () => {
    const dice = makeDice([6, 2, 3, 1, 1]);
    const r = processBoss(dice, { has6: false, has5: false, has4: false });
    expect(r.has6).toBe(true);
    expect(r.has5).toBe(false); // no 5 in these dice
  });

  it("locks 5 only after 6 is locked", () => {
    const dice = makeDice([5, 2, 3, 1, 1]);
    const r = processBoss(dice, { has6: false, has5: false, has4: false });
    expect(r.has5).toBe(false); // 6 not locked yet, so 5 cannot be locked
  });

  it("locks 6, 5, 4 in order and computes cargo", () => {
    const dice = makeDice([6, 5, 4, 3, 2]);
    const r = processBoss(dice, { has6: false, has5: false, has4: false });
    expect(r.has6).toBe(true);
    expect(r.has5).toBe(true);
    expect(r.has4).toBe(true);
    expect(r.cargo).toBe(5); // 3+2
  });

  it("cargo is 0 if crew not complete", () => {
    const dice = makeDice([6, 5, 2, 3, 1]);
    const r = processBoss(dice, { has6: false, has5: false, has4: false });
    expect(r.has6).toBe(true);
    expect(r.has5).toBe(true);
    expect(r.has4).toBe(false);
    expect(r.cargo).toBe(0);
  });
});

describe("roll action", () => {
  it("transitions to rolling phase and uses a roll", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.phase).toBe("rolling");
    expect(s2.current.rollsUsed).toBe(1);
  });

  it("cannot roll more than 3 times", () => {
    let s = initialState(42, settings);
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "roll" });
    expect(s.current.rollsUsed).toBe(3);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.current.rollsUsed).toBe(3);
  });
});

describe("bank action", () => {
  it("banks player cargo and simulates bot", () => {
    let s = initialState(42, settings);
    s = reducer(s, { type: "roll" });
    const s2 = reducer(s, { type: "bank" });
    expect(s2.playerScores).toHaveLength(1);
    expect(s2.botScores).toHaveLength(1);
    expect(s2.roundResult).not.toBeNull();
  });

  it("game ends after max rounds", () => {
    let s = initialState(42, settings);
    for (let i = 0; i < 3; i++) {
      s = reducer(s, { type: "roll" });
      s = reducer(s, { type: "bank" });
      if (!s.gameOver) s = reducer(s, { type: "nextRound" });
    }
    expect(s.gameOver).toBe(true);
  });
});

describe("isTerminal", () => {
  it("not terminal at start", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("terminal when gameOver", () => {
    const s: BossDiceState = { ...initialState(42, settings), gameOver: true, playerScores: [5, 8], botScores: [4, 6] };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThan(0);
  });
});

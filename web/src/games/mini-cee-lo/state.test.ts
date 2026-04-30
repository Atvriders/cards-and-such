import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  evaluateRoll,
  rankOutcome,
  compareOutcomes,
  ROUND_TARGET,
} from "./state.js";

const S = { dummy: false };

describe("MiniCeeLo evaluateRoll", () => {
  it("4-5-6 in any order is win456", () => {
    expect(evaluateRoll([4, 5, 6])).toEqual({ kind: "win456" });
    expect(evaluateRoll([6, 4, 5])).toEqual({ kind: "win456" });
  });

  it("1-2-3 in any order is loss123", () => {
    expect(evaluateRoll([1, 2, 3])).toEqual({ kind: "loss123" });
    expect(evaluateRoll([3, 1, 2])).toEqual({ kind: "loss123" });
  });

  it("triples detected", () => {
    expect(evaluateRoll([3, 3, 3])).toEqual({ kind: "triple", face: 3 });
    expect(evaluateRoll([6, 6, 6])).toEqual({ kind: "triple", face: 6 });
  });

  it("pair + point detected", () => {
    expect(evaluateRoll([1, 1, 6])).toEqual({ kind: "point", pair: 1, point: 6 });
    expect(evaluateRoll([5, 2, 5])).toEqual({ kind: "point", pair: 5, point: 2 });
  });

  it("no scoring is noscore", () => {
    expect(evaluateRoll([1, 4, 5])).toEqual({ kind: "noscore" });
  });
});

describe("MiniCeeLo rank/compare", () => {
  it("4-5-6 outranks triple", () => {
    expect(compareOutcomes({ kind: "win456" }, { kind: "triple", face: 6 })).toBeGreaterThan(0);
  });

  it("triple outranks pair+point", () => {
    expect(compareOutcomes({ kind: "triple", face: 1 }, { kind: "point", pair: 6, point: 6 })).toBeGreaterThan(0);
  });

  it("higher pair+point wins", () => {
    const a = { kind: "point" as const, pair: 5 as const, point: 6 as const };
    const b = { kind: "point" as const, pair: 4 as const, point: 4 as const };
    expect(compareOutcomes(a, b)).toBeGreaterThan(0);
  });

  it("noscore beats loss123", () => {
    expect(compareOutcomes({ kind: "noscore" }, { kind: "loss123" })).toBeGreaterThan(0);
    expect(rankOutcome({ kind: "loss123" })).toBe(0);
  });
});

describe("MiniCeeLo flow", () => {
  it("starts in ready, no wins", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("ready");
    expect(s.playerWins).toBe(0);
    expect(s.cpuWins).toBe(0);
  });

  it("roll fills in dice and outcomes for both sides", () => {
    const s = reducer(initialState(1, S), { type: "roll" });
    expect(s.playerDice).not.toBeNull();
    expect(s.cpuDice).not.toBeNull();
    expect(s.playerOutcome).not.toBeNull();
    expect(s.cpuOutcome).not.toBeNull();
    expect(["player", "cpu", "tie"]).toContain(s.roundResult);
  });

  it("a tie causes round to NOT advance on next", () => {
    let s = initialState(1, S);
    let safety = 100;
    while (safety-- > 0) {
      s = reducer(s, { type: "roll" });
      if (s.roundResult === "tie") {
        const round = s.round;
        const after = reducer(s, { type: "next" });
        expect(after.round).toBe(round);
        return;
      }
      if (s.phase === "rolled") s = reducer(s, { type: "next" });
      if (s.phase === "done") break;
    }
  });

  it("series ends when someone hits ROUND_TARGET wins", () => {
    let s = initialState(123, S);
    let safety = 200;
    while (s.phase !== "done" && safety-- > 0) {
      if (s.phase === "ready") s = reducer(s, { type: "roll" });
      else if (s.phase === "rolled") s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
    expect(Math.max(s.playerWins, s.cpuWins)).toBeGreaterThanOrEqual(ROUND_TARGET);
  });
});

describe("MiniCeeLo isTerminal", () => {
  it("null during play", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });

  it("returns score when done", () => {
    let s = initialState(7, S);
    let safety = 200;
    while (s.phase !== "done" && safety-- > 0) {
      if (s.phase === "ready") s = reducer(s, { type: "roll" });
      else if (s.phase === "rolled") s = reducer(s, { type: "next" });
    }
    const r = isTerminal(s);
    expect(r).not.toBeNull();
    expect(typeof r?.score).toBe("number");
  });
});

import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, evaluateBet, getColor, displayNumber } from "./state.js";
import type { RouletteState } from "./state.js";

const defaultSettings = { maxSpins: "25" as const };

describe("getColor", () => {
  it("0 and 00 (37) are green", () => {
    expect(getColor(0)).toBe("green");
    expect(getColor(37)).toBe("green");
  });

  it("known red numbers are red", () => {
    expect(getColor(1)).toBe("red");
    expect(getColor(3)).toBe("red");
    expect(getColor(32)).toBe("red");
  });

  it("known black numbers are black", () => {
    expect(getColor(2)).toBe("black");
    expect(getColor(4)).toBe("black");
    expect(getColor(35)).toBe("black");
  });
});

describe("displayNumber", () => {
  it("shows 00 for 37", () => {
    expect(displayNumber(37)).toBe("00");
  });

  it("shows normal numbers as strings", () => {
    expect(displayNumber(0)).toBe("0");
    expect(displayNumber(17)).toBe("17");
  });
});

describe("evaluateBet", () => {
  it("straight bet pays 35:1 on exact match", () => {
    expect(evaluateBet({ type: "straight", number: 17, amount: 10 }, 17)).toBe(350);
    expect(evaluateBet({ type: "straight", number: 17, amount: 10 }, 18)).toBe(-10);
  });

  it("red/black bets pay 1:1", () => {
    expect(evaluateBet({ type: "red", amount: 10 }, 1)).toBe(10);   // 1 is red
    expect(evaluateBet({ type: "red", amount: 10 }, 2)).toBe(-10);  // 2 is black
    expect(evaluateBet({ type: "black", amount: 10 }, 2)).toBe(10);
    expect(evaluateBet({ type: "red", amount: 10 }, 0)).toBe(-10);  // green loses
  });

  it("odd/even bets pay 1:1", () => {
    expect(evaluateBet({ type: "odd", amount: 10 }, 1)).toBe(10);
    expect(evaluateBet({ type: "odd", amount: 10 }, 2)).toBe(-10);
    expect(evaluateBet({ type: "even", amount: 10 }, 2)).toBe(10);
    expect(evaluateBet({ type: "odd", amount: 10 }, 0)).toBe(-10);  // 0 loses
  });

  it("low/high bets pay 1:1", () => {
    expect(evaluateBet({ type: "low", amount: 10 }, 1)).toBe(10);
    expect(evaluateBet({ type: "low", amount: 10 }, 18)).toBe(10);
    expect(evaluateBet({ type: "low", amount: 10 }, 19)).toBe(-10);
    expect(evaluateBet({ type: "high", amount: 10 }, 36)).toBe(10);
    expect(evaluateBet({ type: "high", amount: 10 }, 0)).toBe(-10);
  });

  it("dozen bets pay 2:1", () => {
    expect(evaluateBet({ type: "dozen1", amount: 10 }, 1)).toBe(20);
    expect(evaluateBet({ type: "dozen1", amount: 10 }, 12)).toBe(20);
    expect(evaluateBet({ type: "dozen2", amount: 10 }, 13)).toBe(20);
    expect(evaluateBet({ type: "dozen3", amount: 10 }, 25)).toBe(20);
    expect(evaluateBet({ type: "dozen1", amount: 10 }, 13)).toBe(-10);
    expect(evaluateBet({ type: "dozen1", amount: 10 }, 0)).toBe(-10);
  });
});

describe("initialState", () => {
  it("sets up $1000 bankroll and empty bets", () => {
    const s = initialState(42, defaultSettings);
    expect(s.bankroll).toBe(1000);
    expect(s.spinsPlayed).toBe(0);
    expect(s.currentBets).toHaveLength(0);
    expect(s.phase).toBe("betting");
  });
});

describe("place-bet action", () => {
  it("adds a bet to current bets", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "set-bet-amount", amount: 50 });
    const s3 = reducer(s2, { type: "place-bet" });
    expect(s3.currentBets).toHaveLength(1);
    expect(s3.currentBets[0]!.amount).toBe(50);
  });

  it("can add multiple bets", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "set-bet-type", betType: "red" });
    const s3 = reducer(s2, { type: "set-bet-amount", amount: 10 });
    const s4 = reducer(s3, { type: "place-bet" });
    const s5 = reducer(s4, { type: "set-bet-type", betType: "black" });
    const s6 = reducer(s5, { type: "place-bet" });
    expect(s6.currentBets).toHaveLength(2);
  });
});

describe("spin action", () => {
  it("increments spinsPlayed and changes phase", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "set-bet-amount", amount: 10 });
    const s3 = reducer(s2, { type: "place-bet" });
    const s4 = reducer(s3, { type: "spin" });
    expect(s4.spinsPlayed).toBe(1);
    expect(s4.phase).toBe("settled");
    expect(s4.lastNumber).not.toBeNull();
    expect(s4.lastResult).toBeTruthy();
    expect(s4.currentBets).toHaveLength(0);
  });

  it("cannot spin without bets", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "spin" });
    expect(s2.spinsPlayed).toBe(0); // unchanged
  });
});

describe("isTerminal", () => {
  it("not terminal at start", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });

  it("terminal after maxSpins", () => {
    const s = initialState(42, defaultSettings);
    const done: RouletteState = { ...s, phase: "settled", spinsPlayed: 25, bankroll: 800 };
    expect(isTerminal(done)).toEqual({ score: 800 });
  });

  it("terminal when bankroll is 0", () => {
    const s = initialState(42, defaultSettings);
    const broke: RouletteState = { ...s, phase: "settled", spinsPlayed: 3, bankroll: 0 };
    expect(isTerminal(broke)).toEqual({ score: 0 });
  });
});

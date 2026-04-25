import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings = { target: "21" as const };

describe("initialState", () => {
  it("starts with running=0, banked=0, round=1", () => {
    const s = initialState(1, settings);
    expect(s.running).toBe(0);
    expect(s.banked).toBe(0);
    expect(s.round).toBe(1);
    expect(s.target).toBe(21);
    expect(s.over).toBe(false);
  });

  it("starts with 1 die", () => {
    const s = initialState(1, settings);
    expect(s.numDice).toBe(1);
  });
});

describe("addDie / removeDie", () => {
  it("increments numDice", () => {
    const s = initialState(1, settings);
    const after = reducer(s, { type: "addDie" });
    expect(after.numDice).toBe(2);
  });

  it("decrements numDice", () => {
    const s = initialState(1, settings);
    const two = reducer(s, { type: "addDie" });
    const back = reducer(two, { type: "removeDie" });
    expect(back.numDice).toBe(1);
  });

  it("clamps at 1 minimum", () => {
    const s = initialState(1, settings);
    const same = reducer(s, { type: "removeDie" });
    expect(same.numDice).toBe(1);
  });

  it("clamps at 4 maximum", () => {
    let s = initialState(1, settings);
    for (let i = 0; i < 6; i++) s = reducer(s, { type: "addDie" });
    expect(s.numDice).toBe(4);
  });
});

describe("roll action", () => {
  it("adds dice sum to running total", () => {
    const s = initialState(1, settings);
    const after = reducer(s, { type: "roll" });
    expect(after.running).toBeGreaterThan(0);
    expect(after.dice.length).toBe(1);
  });

  it("detects bust when running exceeds target", () => {
    const s = initialState(1, settings);
    const overLimit = { ...s, running: 20, numDice: 2 };
    // 2 dice with min sum 2 → at least 22 > 21
    const after = reducer(overLimit, { type: "roll" });
    expect(after.bust).toBe(true);
  });
});

describe("bank action", () => {
  it("banks current running score and advances round", () => {
    const s = initialState(1, settings);
    const rolled = reducer(s, { type: "roll" });
    const banked = reducer(rolled, { type: "bank" });
    expect(banked.banked).toBeGreaterThan(0);
    expect(banked.round).toBe(2);
    expect(banked.running).toBe(0);
  });

  it("exact target earns 200 pts", () => {
    const s = initialState(1, settings);
    const exactState = { ...s, running: s.target };
    const banked = reducer(exactState, { type: "bank" });
    expect(banked.banked).toBe(200);
  });

  it("ends game after maxRounds", () => {
    let s = initialState(1, settings);
    for (let i = 0; i < s.maxRounds; i++) {
      s = reducer(s, { type: "roll" });
      s = reducer(s, { type: "bank" });
    }
    expect(s.over).toBe(true);
  });
});

describe("isTerminal", () => {
  it("returns null while playing", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns banked score when over", () => {
    const s = { ...initialState(1, settings), over: true, banked: 350 };
    expect(isTerminal(s)!.score).toBe(350);
  });
});
